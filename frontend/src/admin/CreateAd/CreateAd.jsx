import React, { useState } from 'react';
import API from '../../api';

export default function CreateAd({ notify, setTab, loadData }) {
  const [newAd, setNewAd] = useState({ title:'', url:'', description:'', earning_amount:'', timer_seconds:30, daily_limit:100 });
  const [loading, setLoading] = useState(false);

  const createAd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/admin/ads', newAd);
      setNewAd({ title:'', url:'', description:'', earning_amount:'', timer_seconds:30, daily_limit:100 });
      if (loadData) loadData();
      if (notify) notify('Ad created ✅');
      if (setTab) setTab('ads');
    } catch (err) {
      console.error(err);
      if (notify) notify('Failed to create ad', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="sgc-heading">➕ Create Ad</h2>
      <form onSubmit={createAd} className="sgc-form" style={{maxWidth:540}}>
        <label className="sgc-label">Ad Title</label>
        <input className="sgc-input" placeholder="e.g. Visit our website" value={newAd.title} onChange={e=>setNewAd({...newAd,title:e.target.value})} required disabled={loading}/>
        <label className="sgc-label">Ad URL</label>
        <input className="sgc-input" placeholder="https://example.com" value={newAd.url} onChange={e=>setNewAd({...newAd,url:e.target.value})} required disabled={loading}/>
        <label className="sgc-label">Description (optional)</label>
        <input className="sgc-input" placeholder="Short description" value={newAd.description} onChange={e=>setNewAd({...newAd,description:e.target.value})} disabled={loading}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
          <div>
            <label className="sgc-label">Earning (Rs.)</label>
            <input className="sgc-input" type="number" step="0.01" min="0.01" value={newAd.earning_amount} onChange={e=>setNewAd({...newAd,earning_amount:e.target.value})} required disabled={loading}/>
          </div>
          <div>
            <label className="sgc-label">Timer (sec)</label>
            <input className="sgc-input" type="number" min="5" max="120" value={newAd.timer_seconds} onChange={e=>setNewAd({...newAd,timer_seconds:e.target.value})} required disabled={loading}/>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
          <div>
            <label className="sgc-label">Daily Limit</label>
            <input className="sgc-input" type="number" min="1" value={newAd.daily_limit} onChange={e=>setNewAd({...newAd,daily_limit:e.target.value})} required disabled={loading}/>
          </div>
          <div>
            <label className="sgc-label">Valid For</label>
            <select className="sgc-input" value={newAd.valid_for_days || ""} onChange={e=>setNewAd({...newAd,valid_for_days: e.target.value ? parseInt(e.target.value) : null})} disabled={loading}>
              <option value="">Until I pause it</option>
              <option value="1">1 Day</option>
              <option value="3">3 Days</option>
              <option value="7">7 Days</option>
              <option value="15">15 Days</option>
              <option value="30">30 Days</option>
              <option value="60">60 Days</option>
            </select>
          </div>
        </div>
        <button className="sgc-btn-yellow" type="submit" disabled={loading}>
          {loading ? 'Creating...' : '🚀 Create Ad'}
        </button>
      </form>
    </div>
  );
}