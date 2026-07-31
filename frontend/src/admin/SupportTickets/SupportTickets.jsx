/* eslint-disable */
import React, { useState, useEffect } from 'react';
import API from '../../api';

export default function SupportTickets({ notify }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyModal, setReplyModal] = useState(null);
  const [replyMsg, setReplyMsg] = useState('');
  const [replyError, setReplyError] = useState('');

  const fetchTickets = async () => {
    try {
      const res = await API.get('/admin/supporttickets');
      setTickets(res.data);
    } catch (e) {
      console.error(e);
      if (notify) notify('Failed to fetch tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const closeTicket = async (id) => {
    try {
      await API.put(`/admin/supporttickets/${id}/close`);
      fetchTickets();
      if (notify) notify('Ticket closed');
    } catch (e) {
      console.error(e);
      if (notify) notify('Error closing ticket', 'error');
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyModal) return;
    setReplyError('');
    try {
      await API.put(`/admin/supporttickets/${replyModal.id}`, { reply: replyMsg });
      setReplyModal(null);
      setReplyMsg('');
      fetchTickets();
      if (notify) notify('Reply sent ✅');
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err.message || 'Failed to send reply';
      setReplyError(msg);
      if (notify) notify(msg, 'error');
    }
  };

  if (loading) {
    return <div style={{ padding: 20, color: 'var(--dim)' }}>Loading tickets...</div>;
  }

  return (
    <div>
      {tickets.map(t => {
        const isOpen = t.status === 'open';
        const isClosed = t.status === 'closed';
        const borderCol = '#666';
        return (
          <div key={t.id} className="fade-in" style={{ background: 'var(--card)', border: `1.5px solid ${borderCol}40`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ background: isOpen ? '#451a0320' : isClosed ? '#064e3b20' : '#1e3a8a20', padding: '10px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${borderCol}30` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: 'var(--bg)', flexShrink: 0 }}>
                  {t.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: 14, margin: 0 }}>@{t.username}</p>
                    <span style={{ background: t.kyc_status === 'approved' ? '#064e3b' : t.kyc_status === 'pending' ? '#451a03' : '#450a0a', color: t.kyc_status === 'approved' ? '#4ade80' : t.kyc_status === 'pending' ? '#fbbf24' : '#fca5a5', padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700 }}>
                      KYC: {t.kyc_status ? t.kyc_status.toUpperCase() : 'UNVERIFIED'}
                    </span>
                  </div>
                  <p style={{ color: 'var(--dim)', fontSize: 11, margin: '2px 0 0' }}>{new Date(t.created_at).toLocaleString()}</p>
                </div>
              </div>
              <span style={{ background: isOpen ? '#451a03' : isClosed ? '#064e3b' : '#1e3a8a', color: isOpen ? '#f59e0b' : isClosed ? '#4ade80' : '#60a5fa', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{t.status.toUpperCase()}</span>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: 14, margin: '0 0 8px' }}>{t.subject}</p>
              <p style={{ color: 'var(--dim)', fontSize: 13, margin: '0 0 16px', lineHeight: 1.5 }}>{t.message}</p>
              {t.reply && (
                <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8, marginBottom: 16, borderLeft: '3px solid var(--accent)' }}>
                  <p style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 700, margin: '0 0 4px' }}>Admin Response:</p>
                  <p style={{ color: 'var(--dim)', fontSize: 13, margin: 0 }}>{t.reply}</p>
                </div>
              )}
              {isOpen && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="sgc-btn-yellow" onClick={() => setReplyModal(t)}>Response</button>
                  <button className="sgc-btn-sm" style={{ background: '#064e3b', color: '#4ade80', padding: '8px 14px' }} onClick={() => closeTicket(t.id)}>Close</button>
                </div>
              )}
            </div>
          </div>
        );
      })}
      {tickets.length === 0 && <div className="sgc-empty">No tickets yet</div>}

      {replyModal && (
        <div className="sgc-modal-overlay" onClick={() => setReplyModal(null)}>
          <div className="sgc-modal fade-up" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <h3 className="sgc-heading" style={{ marginTop: 0, marginBottom: 16 }}>Reply to @{replyModal.username}</h3>
            <p style={{ color: 'var(--dim)', fontSize: 13, marginBottom: 20 }}><strong style={{ color: 'var(--text)' }}>Subject:</strong> {replyModal.subject}</p>
            {replyError && <p style={{ color: 'var(--red)', marginBottom: 8 }}>{replyError}</p>}
            <form onSubmit={handleReplySubmit} className="sgc-form">
              <label className="sgc-label">Your Response</label>
              <textarea className="sgc-input" rows={5} placeholder="Type your response to the user here..." value={replyMsg} onChange={e => setReplyMsg(e.target.value)} required />
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="submit" className="sgc-btn-primary" style={{ flex: 1 }}>Send response to user</button>
                <button type="button" className="sgc-btn-sm" style={{ padding: '0 20px' }} onClick={() => setReplyModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}