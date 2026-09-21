const itemRepo         = require('../repositories/itemRepo');
const matchRepo        = require('../repositories/matchRepo');
const notificationRepo = require('../repositories/notificationRepo');
const aiClient         = require('../utils/aiClient');
const { haversineKm }  = require('../utils/geo');
const logger           = require('../utils/logger');

// ── Score helpers ─────────────────────────────────────────────────────────────

function scoreSemantic(itemA, itemB) {
  const a = itemA.embeddingVector;
  const b = itemB.embeddingVector;
  if (!a?.length || !b?.length) return 0;
  return aiClient.computeSimilarity(a, b);
}

function scoreGeo(itemA, itemB) {
  const la = itemA.location;
  const lb = itemB.location;
  if (!la?.lat || !lb?.lat) return 0.5; // unknown location — neutral
  const dist = haversineKm(la.lat, la.lng, lb.lat, lb.lng);
  return Math.max(0, 1 - dist / 5.0);
}

function scoreColor(itemA, itemB) {
  const ca = itemA.color?.trim().toLowerCase();
  const cb = itemB.color?.trim().toLowerCase();
  if (!ca && !cb) return 0.5;
  if (!ca || !cb) return 0.5;
  return ca === cb ? 1.0 : 0.0;
}

function scoreImageLabels(itemA, itemB) {
  const setA = new Set((itemA.imageLabels ?? []).map(l => l.toLowerCase()));
  const setB = new Set((itemB.imageLabels ?? []).map(l => l.toLowerCase()));
  if (!setA.size && !setB.size) return 0.5;
  const intersect = [...setA].filter(l => setB.has(l)).length;
  const union     = new Set([...setA, ...setB]).size;
  return union > 0 ? intersect / union : 0.5;
}

function computeConfidence(item, candidate) {
  const sem = scoreSemantic(item, candidate);
  const cat = 1.0; // candidates pre-filtered by category
  const geo = scoreGeo(item, candidate);
  const col = scoreColor(item, candidate);
  const img = scoreImageLabels(item, candidate);

  const score = sem * 50 + cat * 15 + geo * 15 + col * 10 + img * 10;
  return {
    score: Math.round(score * 10) / 10,
    breakdown: { semantic: sem, category: cat, geo, color: col, imageLabels: img },
  };
}

// ── Notification helpers ──────────────────────────────────────────────────────

async function notify(userId, type, message, relatedItemId, relatedMatchId) {
  try {
    await notificationRepo.create({ userId, type, message, relatedItemId, relatedMatchId });
  } catch (err) {
    logger.warn('Failed to create notification:', err.message);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

const matchService = {

  async triggerMatchingForItem(newItemId) {
    const item = await itemRepo.findById(newItemId);
    if (!item) return;

    const oppositeType  = item.type === 'lost' ? 'found' : 'lost';
    const createdAfter  = new Date(item.createdAt.getTime() - 30 * 24 * 60 * 60 * 1000);
    const lat           = item.location?.lat;
    const lng           = item.location?.lng;

    const candidates = await itemRepo.findCandidatesForMatching(
      oppositeType,
      item.category,
      lat,
      lng,
      createdAfter
    );

    if (!candidates.length) return;

    let topMatch = null;

    for (const candidate of candidates) {
      const { score, breakdown } = computeConfidence(item, candidate);

      if (score < 40) continue;

      const lostItemId  = item.type === 'lost' ? item._id : candidate._id;
      const foundItemId = item.type === 'lost' ? candidate._id : item._id;

      const match = await matchRepo.upsertForPair(lostItemId, foundItemId, {
        confidenceScore: score,
        breakdown,
        status: 'PENDING',
      });

      if (!topMatch || score > topMatch.score) {
        topMatch = { score, matchId: match._id };
      }

      if (score >= 70) {
        // Update both items to POTENTIAL_MATCH if still in base status
        await Promise.all([
          itemRepo.update(item._id, { status: item.status === 'LOST' || item.status === 'FOUND' ? 'POTENTIAL_MATCH' : item.status }),
          itemRepo.update(candidate._id, { status: candidate.status === 'LOST' || candidate.status === 'FOUND' ? 'POTENTIAL_MATCH' : candidate.status }),
        ]);

        const lostItem  = item.type === 'lost' ? item : candidate;
        const foundItem = item.type === 'lost' ? candidate : item;

        await Promise.all([
          notify(
            lostItem.userId,
            'MATCH_FOUND',
            `A potential match was found for your lost item "${lostItem.title}".`,
            lostItem._id,
            match._id
          ),
          notify(
            foundItem.userId,
            'MATCH_FOUND',
            `Your found item "${foundItem.title}" may belong to someone.`,
            foundItem._id,
            match._id
          ),
        ]);
      }
    }

    if (topMatch) {
      logger.info(`triggerMatchingForItem(${newItemId}): top match score=${topMatch.score} matchId=${topMatch.matchId}`);
    }
  },

  async getMatchesForItem(itemId) {
    const Match = require('../models/Match');
    return Match.find({ $or: [{ lostItemId: itemId }, { foundItemId: itemId }] })
      .populate('lostItemId',  'title images location category status color userId')
      .populate('foundItemId', 'title images location category status color userId')
      .sort({ confidenceScore: -1 });
  },

  async getMyMatches(userId) {
    const Item  = require('../models/Item');
    const Match = require('../models/Match');
    const itemIds = await Item.find({ userId }, '_id').lean().then(docs => docs.map(d => d._id));
    if (!itemIds.length) return [];
    return Match.find({
      $or: [{ lostItemId: { $in: itemIds } }, { foundItemId: { $in: itemIds } }],
    })
      .populate('lostItemId',  'title images location category status color userId')
      .populate('foundItemId', 'title images location category status color userId')
      .sort({ createdAt: -1 });
  },

  async acceptMatch(matchId, userId) {
    const Match = require('../models/Match');
    const match = await Match.findById(matchId)
      .populate('lostItemId',  'title userId')
      .populate('foundItemId', 'title userId');

    if (!match) {
      const err = new Error('Match not found'); err.statusCode = 404; throw err;
    }

    const lostOwnerId  = String(match.lostItemId.userId);
    const foundOwnerId = String(match.foundItemId.userId);
    const uid          = String(userId);

    if (uid !== lostOwnerId && uid !== foundOwnerId) {
      const err = new Error('Not authorized'); err.statusCode = 403; throw err;
    }

    match.status = 'ACCEPTED';
    await match.save();

    await Promise.all([
      itemRepo.update(match.lostItemId._id,  { status: 'CLAIMED' }),
      itemRepo.update(match.foundItemId._id, { status: 'CLAIMED' }),
    ]);

    await Promise.all([
      notify(
        match.lostItemId.userId,
        'ITEM_CLAIMED',
        `Your lost item "${match.lostItemId.title}" has been claimed.`,
        match.lostItemId._id,
        match._id
      ),
      notify(
        match.foundItemId.userId,
        'ITEM_CLAIMED',
        `The found item "${match.foundItemId.title}" has been claimed by its owner.`,
        match.foundItemId._id,
        match._id
      ),
    ]);

    return match;
  },

  async rejectMatch(matchId, userId) {
    const Match = require('../models/Match');
    const match = await Match.findById(matchId)
      .populate('lostItemId',  'userId')
      .populate('foundItemId', 'userId');

    if (!match) {
      const err = new Error('Match not found'); err.statusCode = 404; throw err;
    }

    const lostOwnerId  = String(match.lostItemId.userId);
    const foundOwnerId = String(match.foundItemId.userId);
    const uid          = String(userId);

    if (uid !== lostOwnerId && uid !== foundOwnerId) {
      const err = new Error('Not authorized'); err.statusCode = 403; throw err;
    }

    match.status = 'REJECTED';
    await match.save();
    return match;
  },
};

module.exports = matchService;
