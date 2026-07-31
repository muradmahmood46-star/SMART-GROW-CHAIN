export const STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SENT: 'sent',
  CONFIRMED: 'confirmed',
  OPEN: 'open',
  REPLIED: 'replied',
  CLOSED: 'closed',
  COMPLETED: 'completed',
  ACTIVE: 'active',
};

export const STATUS_COLORS = {
  pending:   { bg: '#451a03', text: '#f59e0b', border: '#f59e0b' },
  approved:  { bg: '#064e3b', text: '#4ade80', border: '#3cb559' },
  rejected:  { bg: '#450a0a', text: '#fca5a5', border: '#ef4444' },
  sent:      { bg: '#1e3a6e', text: '#38bdf8', border: '#3cb559' },
  confirmed: { bg: '#064e3b', text: '#4ade80', border: '#3cb559' },
  open:      { bg: '#451a03', text: '#f59e0b', border: '#f59e0b' },
  replied:   { bg: '#064e3b', text: '#4ade80', border: '#3cb559' },
  closed:    { bg: '#1e293b', text: '#94a3b8', border: '#334155' },
  completed: { bg: '#1e3a6e', text: '#38bdf8', border: '#1e4080' },
  active:    { bg: '#064e3b', text: '#4ade80', border: '#166534' },
};

export const getStatusColor = (status) => STATUS_COLORS[status] || STATUS_COLORS.pending;