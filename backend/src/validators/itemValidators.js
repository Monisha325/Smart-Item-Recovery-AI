const { z } = require('zod');

// Handles both a JSON string (multipart text field) and a plain object (JSON body).
const locationSchema = z.preprocess(
  (val) => {
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return val; }
    }
    return val;
  },
  z.object({
    name: z.string().min(2, 'Location name must be at least 2 characters'),
    lat:  z.coerce.number().min(-90,  'Latitude must be >= -90').max(90,  'Latitude must be <= 90'),
    lng:  z.coerce.number().min(-180, 'Longitude must be >= -180').max(180, 'Longitude must be <= 180'),
  })
);

const createItemSchema = z.object({
  title:       z.string().min(3, 'Title must be at least 3 characters').max(100).trim(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000).trim(),
  category:    z.enum(['electronics', 'clothing', 'accessories', 'documents', 'bags', 'others']),
  type:        z.enum(['lost', 'found']),
  color:       z.string().trim().optional(),
  location:    locationSchema,
});

const updateItemSchema = createItemSchema.partial();

module.exports = { createItemSchema, updateItemSchema };
