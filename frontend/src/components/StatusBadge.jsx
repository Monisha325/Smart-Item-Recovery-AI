const STATUS_MAP = {
  LOST:            { label: 'Lost',            color: 'bg-red-100 text-red-700' },
  FOUND:           { label: 'Found',           color: 'bg-blue-100 text-blue-700' },
  POTENTIAL_MATCH: { label: 'Potential Match', color: 'bg-amber-100 text-amber-700' },
  CLAIMED:         { label: 'Claimed',         color: 'bg-teal-100 text-teal-700' },
  RETURNED:        { label: 'Returned',        color: 'bg-green-100 text-green-700' },
  ARCHIVED:        { label: 'Archived',        color: 'bg-gray-100 text-gray-500' },
  PENDING:         { label: 'Pending',         color: 'bg-amber-100 text-amber-700' },
  ACCEPTED:        { label: 'Accepted',        color: 'bg-green-100 text-green-700' },
  REJECTED:        { label: 'Rejected',        color: 'bg-red-100 text-red-700' },
};

export default function StatusBadge({ status, className = '' }) {
  const cfg   = STATUS_MAP[status] ?? { label: status ?? '—', color: 'bg-gray-100 text-gray-600' };
  const label = cfg.label.replace(/_/g, ' ');
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color} ${className}`}>
      {label}
    </span>
  );
}
