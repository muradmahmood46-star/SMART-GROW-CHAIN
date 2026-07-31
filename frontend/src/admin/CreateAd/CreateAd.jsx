import React from 'react';

export default function CreateAd({ newAd, setNewAd, createAd }) {
  return (
    <div>
      <h2 className="sgc-heading">➕ Create Ad</h2>
      <form onSubmit={createAd} className="sgc-form" style={{maxWidth:540}}>
        <label className="sgc-label">Ad Title</label>
        <input className="sgc-input" placeholder="e.g. Visit our website" value={newAd.title} onChange={e=>setNewAd({...newAd,title:e.target.value})} required/>
        <label className="sgc-label">Ad URL</label>
        <input className="sgc-input" placeholder="https://example.com" value={newAd.url} onChange={e=>setNewAd({...newAd,url:e.target.value})} required/>
        <label className="sgc-label">Description (optional)</label>
        <input className="sgc-input" placeholder="Short description" value={newAd.description} onChange={e=>setNewAd({...newAd,description:e.target.value})}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
          <div>
            <label className="sgc-label">Earning (Rs.)</label>
            <input className="sgc-input" type="number" step="0.01" min="0.01" value={newAd.earning_amount} onChange={e=>setNewAd({...newAd,earning_amount:e.target.value})} required/>
          </div>
          <div>
            <label className="sgc-label">Timer (sec)</label>
            <input className="sgc-input" type="number" min="5" max="120" value={newAd.timer_seconds} onChange={e=>setNewAd({...newAd,timer_seconds:e.target.value})} required/>
          </div>
          <div>
            <label className="sgc-label">Daily Limit</label>
            <input className="sgc-input" type="number" min="1" value={newAd.daily_limit} onChange={e=>setNewAd({...newAd,daily_limit:e.target.value})} required/>
          </div>
        </div>
        <button className="sgc-btn-yellow" type="submit">🚀 Create Ad</button>
      </form>
    </div>
  );
}