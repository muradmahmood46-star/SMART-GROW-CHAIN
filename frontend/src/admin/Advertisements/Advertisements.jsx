/* eslint-disable */
import React, { useState, useEffect } from 'react';
import API from '../../api';

export default function Advertisements({ setTab, onCreateAd, notify, loadData }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingAd, setEditingAd] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '', url: '', earning_amount: 0, timer_seconds: 0, daily_limit: 0
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchAds = async () => {
    try {
      const res = await API.get('/admin/ads');
      setAds(res.data);
    } catch (e) {
      console.error(e);
      if (notify) notify('Failed to fetch ads', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const toggleAd = async (id) => {
    try {
      await API.put(`/admin/ads/${id}/toggle`);
      fetchAds();
      if (loadData) loadData();
      if (notify) notify('Ad status updated');
    } catch (e) {
      if (notify) notify('Error toggling ad', 'error');
    }
  };

  const deleteAd = async (id) => {
    if (!window.confirm('Delete this ad?')) return;
    try {
      await API.delete(`/admin/ads/${id}`);
      fetchAds();
      if (loadData) loadData();
      if (notify) notify('Ad deleted');
    } catch (e) {
      if (notify) notify('Error deleting ad', 'error');
    }
  };

  const openEditModal = (ad) => {
    setEditingAd(ad);
    setEditForm({
      title: ad.title || '',
      url: ad.url || '',
      earning_amount: ad.earning_amount || 0,
      timer_seconds: ad.timer_seconds || 0,
      daily_limit: ad.daily_limit || 0
    });
  };

  const handleUpdateAd = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await API.put(`/admin/ads/${editingAd.id}`, editForm);
      if (notify) notify('Ad updated successfully ✅');
      setEditingAd(null);
      fetchAds();
      if (loadData) loadData();
    } catch (err) {
      if (notify) notify('Failed to update ad', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateAdClick = () => {
    if (setTab) {
      setTab('create-ad');
    } else if (onCreateAd) {
      onCreateAd();
    }
  };

  const filteredAds = ads.filter(a => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const titleMatch = (a.title || '').toLowerCase().includes(q);
    const usernameMatch = (a.username || '').toLowerCase().includes(q);
    const urlMatch = (a.url || '').toLowerCase().includes(q);
    return titleMatch || usernameMatch || urlMatch;
  });

  return (
    <div>
      <div className="sgc-page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12,marginBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
          <h2 className="sgc-heading" style={{margin:0}}>📺 Advertisements ({ads.length})</h2>
          
          {/* SEARCH INPUT BY USERNAME OR AD NAME */}
          <div style={{position:'relative',minWidth:280}}>
            <input
              type="text"
              className="sgc-input"
              style={{margin:0,padding:'9px 14px 9px 36px',fontSize:13,borderRadius:10,background:'var(--card)',border:'1px solid var(--border)'}}
              placeholder="🔍 Search ad by username or ad name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:14,color:'var(--dim)'}}>🔍</span>
          </div>
        </div>

        {/* FUNCTIONAL CREATE AD YELLOW BUTTON */}
        <button
          className="sgc-btn-sm"
          style={{background:'var(--yellow)',color:'var(--bg)',padding:'10px 20px',fontWeight:800,fontSize:13,borderRadius:10,cursor:'pointer',border:'none',boxShadow:'0 4px 14px rgba(245,158,11,0.4)',display:'flex',alignItems:'center',gap:6}}
          onClick={handleCreateAdClick}>
          ➕ Create Ad
        </button>
      </div>

      {searchQuery && (
        <p style={{color:'var(--dim)',fontSize:12,marginBottom:14,fontWeight:600}}>
          Showing {filteredAds.length} search results for "<span style={{color:'var(--yellow)'}}>{searchQuery}</span>"
        </p>
      )}

      <div className="sgc-table-wrap">
        <table className="sgc-table">
          <thead>
            <tr>
              <th className="sgc-th">Ad Title / Name</th>
              <th className="sgc-th">Created By</th>
              <th className="sgc-th">Ad Type</th>
              <th className="sgc-th">URL</th>
              <th className="sgc-th">Earn/Click</th>
              <th className="sgc-th">Timer</th>
              <th className="sgc-th">Clicks</th>
              <th className="sgc-th">Status</th>
              <th className="sgc-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAds.map(a => (
              <tr key={a.id} className="sgc-tr">
                <td className="sgc-td" style={{color:'var(--text)',fontWeight:700,fontSize:14}}>{a.title}</td>
                <td className="sgc-td">
                  <span style={{color:a.username==='Admin'?'var(--yellow)':'var(--accent)',fontWeight:700,fontSize:12}}>
                    {a.username==='Admin' ? '👑 Admin' : `@${a.username}`}
                  </span>
                </td>
                <td className="sgc-td">
                  <span style={{
                    background: a.is_sponsored ? '#451a03' : '#0c2847',
                    color: a.is_sponsored ? '#f59e0b' : '#38bdf8',
                    border: `1px solid ${a.is_sponsored ? '#f59e0b40' : '#0284c740'}`,
                    padding: '3px 10px',
                    borderRadius: 14,
                    fontSize: 10,
                    fontWeight: 800
                  }}>
                    {a.is_sponsored ? '🔥 Sponsored' : '📢 Simple Ad'}
                  </span>
                </td>
                <td className="sgc-td" style={{fontSize:11,color:'var(--dim)',maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  <a href={a.url} target="_blank" rel="noreferrer" style={{color:'var(--accent)'}}>{a.url}</a>
                </td>
                <td className="sgc-td" style={{color:'var(--green)',fontWeight:700}}>Rs. {a.earning_amount}</td>
                <td className="sgc-td">{a.timer_seconds}s</td>
                <td className="sgc-td">{a.total_clicks}</td>
                <td className="sgc-td">
                  <span className="sgc-badge" style={{background:a.is_active?'#064e3b':'#334155',color:a.is_active?'#4ade80':'#94a3b8'}}>
                    {a.is_active ? 'Active' : 'Paused'}
                  </span>
                </td>
                <td className="sgc-td" style={{display:'flex',gap:6}}>
                  <button className="sgc-btn-sm" style={{background:'#0c2847',color:'#38bdf8'}} onClick={()=>openEditModal(a)}>
                    Edit
                  </button>
                  <button className="sgc-btn-sm" style={{background:'var(--border)',color:'var(--muted)'}} onClick={()=>toggleAd(a.id)}>
                    {a.is_active ? 'Pause' : 'Activate'}
                  </button>
                  <button className="sgc-btn-sm" style={{background:'#450a0a',color:'#fca5a5'}} onClick={()=>deleteAd(a.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredAds.length === 0 && (
              <tr>
                <td colSpan={9} className="sgc-td" style={{textAlign:'center',padding:32}}>
                  {searchQuery ? 'No matching ads found' : 'No ads created yet'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT AD MODAL */}
      {editingAd && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16,
            padding: 24, width: '100%', maxWidth: 500,
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
          }}>
            <h3 className="sgc-subheading" style={{marginTop: 0}}>✏️ Edit Ad</h3>
            <form onSubmit={handleUpdateAd} className="sgc-form">
              <label className="sgc-label">Ad Title</label>
              <input className="sgc-input" required value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />

              <label className="sgc-label">Ad URL</label>
              <input className="sgc-input" required value={editForm.url} onChange={e => setEditForm({...editForm, url: e.target.value})} />

              <label className="sgc-label">Earn per Click (Rs.)</label>
              <input className="sgc-input" type="number" step="0.001" required value={editForm.earning_amount} onChange={e => setEditForm({...editForm, earning_amount: parseFloat(e.target.value)})} />

              <label className="sgc-label">Timer (Seconds)</label>
              <input className="sgc-input" type="number" required value={editForm.timer_seconds} onChange={e => setEditForm({...editForm, timer_seconds: parseInt(e.target.value)})} />

              <label className="sgc-label">Daily Click Limit</label>
              <input className="sgc-input" type="number" required value={editForm.daily_limit} onChange={e => setEditForm({...editForm, daily_limit: parseInt(e.target.value)})} />

              <div style={{display: 'flex', gap: 12, marginTop: 24}}>
                <button type="button" onClick={() => setEditingAd(null)} className="sgc-btn-secondary" style={{flex: 1}}>Cancel</button>
                <button type="submit" className="sgc-btn-primary" disabled={isUpdating} style={{flex: 1}}>
                  {isUpdating ? 'Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}