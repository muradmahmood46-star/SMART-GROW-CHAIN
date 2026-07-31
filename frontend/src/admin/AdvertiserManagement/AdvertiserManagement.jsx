/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { getAdvertiserManagement, getAdvertiserDetail } from '../../services/admin/adminService';

export default function AdvertiserManagement({ notify }) {
  const [advertiserList, setAdvertiserList] = useState([]);
  const [advertiserDetail, setAdvertiserDetail] = useState(null);
  const [advertiserLoading, setAdvertiserLoading] = useState(true);

  const fetchAdvertisers = async () => {
    try {
      setAdvertiserLoading(true);
      const r = await getAdvertiserManagement();
      setAdvertiserList(r.data);
    } catch (e) {
      console.error(e);
      if (notify) notify('Failed to fetch advertisers', 'error');
    } finally {
      setAdvertiserLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvertisers();
  }, []);

  const handleViewDetail = async (userId) => {
    try {
      setAdvertiserLoading(true);
      const r = await getAdvertiserDetail(userId);
      setAdvertiserDetail(r.data);
    } catch (e) {
      if (notify) notify('Failed to fetch advertiser details', 'error');
    } finally {
      setAdvertiserLoading(false);
    }
  };

  return (
    <div>
      {advertiserDetail ? (
        <div>
          <button onClick={()=>setAdvertiserDetail(null)} style={{background:'none',border:'none',color:'var(--accent)',cursor:'pointer',fontSize:13,fontWeight:600,marginBottom:16,fontFamily:'var(--font)',padding:0}}>← Back to Advertiser List</button>
          <div style={{background:'linear-gradient(135deg,#0d1e38,#1e3a6e)',border:'1px solid #1e4080',borderRadius:14,padding:'20px 22px',marginBottom:20}}>
            <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:16,flexWrap:'wrap'}}>
              <div style={{width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg,var(--yellow),#d97706)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:22,color:'var(--bg)',flexShrink:0}}>{advertiserDetail.username[0].toUpperCase()}</div>
              <div>
                <p style={{color:'var(--text)',fontWeight:800,fontSize:18,margin:0}}>@{advertiserDetail.username}</p>
                <p style={{color:'var(--dim)',fontSize:12,margin:'2px 0 0'}}>{advertiserDetail.email} &bull; <span style={{color:'var(--accent)',textTransform:'capitalize'}}>{advertiserDetail.membership}</span> &bull; Joined {new Date(advertiserDetail.joined).toLocaleDateString()}</p>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:10}}>
              {[
                ['Total Ads',advertiserDetail.total_ads,'var(--accent)'],
                ['Total Clicks',advertiserDetail.total_clicks_received,'var(--green)'],
                ['Actual Viewers',advertiserDetail.total_actual_viewers,'#38bdf8'],
                ['Budget Spent',`Rs.${advertiserDetail.total_budget_spent}`,'var(--yellow)'],
                ['Active',advertiserDetail.active_ads,'#4ade80'],
                ['Completed',advertiserDetail.completed_ads,'var(--purple)'],
                ['Pending',advertiserDetail.pending_ads,'#fbbf24'],
              ].map(([l,v,c])=>(
                <div key={l} style={{background:'rgba(0,0,0,.25)',borderRadius:10,padding:'10px 12px',textAlign:'center'}}>
                  <p style={{color:'var(--dim)',fontSize:10,fontWeight:700,margin:'0 0 4px',letterSpacing:.5}}>{l.toUpperCase()}</p>
                  <p style={{color:c,fontSize:18,fontWeight:800,margin:0}}>{v}</p>
                </div>
              ))}
            </div>
          </div>
          <h3 style={{color:'var(--text)',fontWeight:800,fontSize:15,marginBottom:14}}>📋 All Campaigns</h3>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {advertiserDetail.ads.map((ad)=>{
              const isActive=ad.status==='approved'; const isDone=ad.status==='completed';
              const isPending=ad.status==='pending'; const isRejected=ad.status==='rejected';
              const accentCol=isActive?'#4ade80':isDone?'#38bdf8':isPending?'#fbbf24':'#f87171';
              const borderCol=isActive?'#166534':isDone?'#1e4080':isPending?'#92400e':'#7f1d1d';
              const bgCol=isActive?'#052e16':isDone?'#0c1e3e':isPending?'#1c1000':'#1c0a0a';
              return (
                <div key={ad.id} style={{background:bgCol,border:`1.5px solid ${borderCol}`,borderRadius:14,overflow:'hidden'}}>
                  <div style={{padding:'12px 16px',borderBottom:`1px solid ${borderCol}`,display:'flex',justifyContent:'space-between',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{color:'var(--text)',fontWeight:800,fontSize:15,margin:'0 0 2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ad.title}</p>
                      <p style={{color:'var(--dim)',fontSize:11,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>🔗 {ad.url}</p>
                    </div>
                    <span style={{background:isActive?'#064e3b':isDone?'#1e3a6e':isPending?'#451a03':'#450a0a',color:accentCol,padding:'3px 14px',borderRadius:20,fontSize:11,fontWeight:800,whiteSpace:'nowrap'}}>
                      {isActive?'✅ ACTIVE':isDone?'🏁 DONE':isPending?'⏳ PENDING':'REJECTED'}
                    </span>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(100px,1fr))',gap:0,borderBottom:`1px solid ${borderCol}`}}>
                    {[
                      ['💰','Budget',`Rs.${ad.total_budget}`],
                      ['👥','Target',ad.members_needed],
                      ['✅','Reached',ad.members_reached],
                      ['👁️','Viewers',ad.actual_viewers],
                      ['⏳','Remaining',ad.remaining_clicks],
                      ['📊','Progress',`${ad.progress_pct}%`],
                    ].map(([icon,label,val],si,arr)=>(
                      <div key={label} style={{padding:'10px 8px',textAlign:'center',borderRight:si<arr.length-1?`1px solid ${borderCol}`:'none'}}>
                        <p style={{fontSize:16,margin:'0 0 2px'}}>{icon}</p>
                        <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 2px',fontWeight:600}}>{label}</p>
                        <p style={{color:accentCol,fontSize:12,fontWeight:800,margin:0}}>{val}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{padding:'10px 16px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                      <span style={{color:'var(--dim)',fontSize:11,fontWeight:600}}>PROGRESS</span>
                      <span style={{color:accentCol,fontSize:11,fontWeight:800}}>{ad.members_reached}/{ad.members_needed}</span>
                    </div>
                    <div style={{height:8,background:'#0b1120',borderRadius:6,overflow:'hidden',border:'1px solid var(--border)'}}>
                      <div style={{width:`${ad.progress_pct}%`,height:'100%',background:`linear-gradient(90deg,${accentCol},${isDone?'#818cf8':isActive?'#86efac':'#fde68a'})`,borderRadius:6}}/>
                    </div>
                    <p style={{color:'var(--dim)',fontSize:10,margin:'6px 0 0'}}>Submitted: {new Date(ad.created_at).toLocaleString()}{ad.admin_note&&<span style={{color:'#fbbf24',marginLeft:8}}>Note: {ad.admin_note}</span>}</p>
                  </div>
                </div>
              );
            })}
            {advertiserDetail.ads.length===0&&<div className="sgc-empty">No campaigns found.</div>}
          </div>
        </div>
      ) : (
        <div>
          <div className="sgc-page-header">
            <h2 className="sgc-heading">📊 Advertiser Management</h2>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <span style={{color:'var(--dim)',fontSize:13,background:'var(--card)',padding:'4px 12px',borderRadius:20,border:'1px solid var(--border)'}}>{advertiserList.length} advertisers</span>
              <button className="sgc-btn-sm" style={{background:'#1e3a6e',color:'var(--accent)',padding:'6px 14px'}} onClick={fetchAdvertisers}>🔄 Refresh</button>
            </div>
          </div>
          {advertiserLoading && <div style={{textAlign:'center',padding:40,color:'var(--dim)',fontSize:14}}>⏳ Loading advertisers...</div>}
          {!advertiserLoading && (
            <>
              <div className="sgc-stats" style={{marginBottom:24}}>
                {[
                  ['Total Advertisers',advertiserList.length,'var(--accent)'],
                  ['Total Campaigns',advertiserList.reduce((s,a)=>s+a.total_ads,0),'var(--yellow)'],
                  ['Active Campaigns',advertiserList.reduce((s,a)=>s+a.active_ads,0),'var(--green)'],
                  ['Total Budget',`Rs.${advertiserList.reduce((s,a)=>s+a.total_budget_spent,0).toFixed(2)}`,'var(--purple)'],
                ].map(([l,v,c])=>(
                  <div key={l} className="sgc-stat-card">
                    <div className="sgc-stat-label">{l}</div>
                    <div className="sgc-stat-val" style={{color:c}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                {advertiserList.map((adv)=>(
                  <div key={adv.user_id} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,overflow:'hidden',transition:'border-color .2s'}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor='var(--yellow)'}
                    onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                    <div style={{padding:'14px 18px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
                      <div style={{display:'flex',alignItems:'center',gap:12}}>
                        <div style={{width:40,height:40,borderRadius:'50%',background:'linear-gradient(135deg,var(--yellow),#d97706)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:18,color:'var(--bg)',flexShrink:0}}>{adv.username[0].toUpperCase()}</div>
                        <div>
                          <p style={{color:'var(--text)',fontWeight:700,fontSize:15,margin:0}}>@{adv.username}</p>
                          <p style={{color:'var(--dim)',fontSize:11,margin:'2px 0 0'}}>{adv.email} &bull; <span style={{color:'var(--accent)',textTransform:'capitalize'}}>{adv.membership}</span></p>
                        </div>
                      </div>
                      <button onClick={()=>handleViewDetail(adv.user_id)}
                        style={{padding:'8px 18px',background:'linear-gradient(135deg,var(--yellow),#d97706)',border:'none',borderRadius:9,color:'var(--bg)',fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'var(--font)',whiteSpace:'nowrap'}}>
                        View Details →
                      </button>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(100px,1fr))',gap:0}}>
                      {[
                        ['📢','Total Ads',adv.total_ads,'var(--accent)'],
                        ['✅','Clicks',adv.total_clicks_received,'var(--green)'],
                        ['💰','Budget',`Rs.${adv.total_budget_spent}`,'var(--yellow)'],
                        ['🟢','Active',adv.active_ads,'#4ade80'],
                        ['🏁','Done',adv.completed_ads,'var(--purple)'],
                      ].map(([icon,label,val,col],si,arr)=>(
                        <div key={label} style={{padding:'12px 8px',textAlign:'center',borderRight:si<arr.length-1?'1px solid var(--border)':'none'}}>
                          <p style={{fontSize:18,margin:'0 0 2px'}}>{icon}</p>
                          <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 3px',fontWeight:600}}>{label}</p>
                          <p style={{color:col,fontSize:14,fontWeight:800,margin:0}}>{val}</p>
                        </div>
                      ))}
                    </div>
                    {adv.ads.length>0&&(
                      <div style={{borderTop:'1px solid var(--border)',padding:'10px 18px'}}>
                        <p style={{color:'var(--dim)',fontSize:10,fontWeight:700,letterSpacing:.5,margin:'0 0 8px'}}>CAMPAIGNS</p>
                        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                          {adv.ads.slice(0,4).map(ad=>(
                            <div key={ad.id} style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:8,padding:'4px 12px',fontSize:11}}>
                              <span style={{color:'var(--text)',fontWeight:600,marginRight:6}}>{ad.title?.substring(0,20)}{ad.title?.length>20?'...':''}</span>
                              <span style={{background:ad.status==='approved'?'#064e3b':ad.status==='completed'?'#1e3a6e':ad.status==='pending'?'#451a03':'#450a0a',color:ad.status==='approved'?'#4ade80':ad.status==='completed'?'#38bdf8':ad.status==='pending'?'#fbbf24':'#fca5a5',padding:'1px 7px',borderRadius:20,fontSize:10,fontWeight:700}}>{ad.status}</span>
                            </div>
                          ))}
                          {adv.ads.length>4&&<span style={{color:'var(--dim)',fontSize:11,padding:'4px 8px'}}>+{adv.ads.length-4} more</span>}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {advertiserList.length===0&&<div className="sgc-empty">No advertisers found. Users who submit ad campaigns will appear here.</div>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}