/* eslint-disable */
import React, { useState, useEffect } from 'react';
import API from '../../api';

export default function ReferralCommission({ notify }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await API.get('/admin/referral-settings');
      setSettings(res.data);
    } catch (e) {
      console.error(e);
      if (notify) notify('Failed to fetch referral settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.put('/admin/referral-settings', settings);
      if (notify) notify('Referral settings updated successfully ✅');
    } catch (e) {
      console.error(e);
      if (notify) notify('Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div style={{padding:20, color:'var(--dim)'}}>Loading referral settings...</div>;
  }

  const Toggle = ({ active, onClick }) => (
    <div onClick={onClick} style={{width:48,height:26,borderRadius:13,background:active?'var(--green)':'var(--border)',cursor:'pointer',position:'relative',transition:'background .2s',flexShrink:0}}>
      <div style={{position:'absolute',top:3,left:active?24:3,width:20,height:20,borderRadius:'50%',background:'#fff',transition:'left .2s'}}/>
    </div>
  );

  const renderLevels = (keyPrefix, symbol, suffix) => (
    <div style={{display:'flex', gap: 24, marginTop: 16, flexWrap:'wrap', background:'rgba(255,255,255,0.02)', padding:16, borderRadius:8}}>
      <div style={{display:'flex', alignItems:'center', gap: 8}}>
        <span style={{color:'var(--text)', fontSize: 14, fontWeight:600}}>Level 1:</span>
        <input type="number" min="0" step="any" className="sgc-input" style={{width: 80, margin: 0, padding: '6px 10px'}} 
          value={settings[`${keyPrefix}_l1`] || ''} onChange={e=>handleChange(`${keyPrefix}_l1`, e.target.value)} />
        <span style={{color:'var(--dim)', fontSize: 14, fontWeight:600}}>{symbol}</span>
      </div>
      <div style={{display:'flex', alignItems:'center', gap: 8}}>
        <span style={{color:'var(--text)', fontSize: 14, fontWeight:600}}>Level 2:</span>
        <input type="number" min="0" step="any" className="sgc-input" style={{width: 80, margin: 0, padding: '6px 10px'}} 
          value={settings[`${keyPrefix}_l2`] || ''} onChange={e=>handleChange(`${keyPrefix}_l2`, e.target.value)} />
        <span style={{color:'var(--dim)', fontSize: 14, fontWeight:600}}>{symbol}</span>
      </div>
      <div style={{display:'flex', alignItems:'center', gap: 8}}>
        <span style={{color:'var(--text)', fontSize: 14, fontWeight:600}}>Level 3:</span>
        <input type="number" min="0" step="any" className="sgc-input" style={{width: 80, margin: 0, padding: '6px 10px'}} 
          value={settings[`${keyPrefix}_l3`] || ''} onChange={e=>handleChange(`${keyPrefix}_l3`, e.target.value)} />
        <span style={{color:'var(--dim)', fontSize: 14, fontWeight:600}}>{symbol}</span>
      </div>
      <div style={{width:'100%', color:'var(--dim)', fontSize:12, marginTop: -8}}>{suffix}</div>
    </div>
  );

  return (
    <div style={{maxWidth: 800}}>
      <h2 className="sgc-heading">⚙️ Global Referral System</h2>
      
      {/* MASTER SWITCH */}
      <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,padding:'24px',marginBottom:24, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <h3 style={{color:'var(--text)',fontWeight:800,fontSize:18,margin:0}}>Enable Referral System</h3>
          <p style={{color:'var(--dim)',fontSize:13,margin:'6px 0 0',maxWidth:500,lineHeight:1.6}}>
            This is the Master Switch. If you turn this OFF, no referral commissions of any kind will be distributed across the entire platform. Turn it ON to enable the bonuses below.
          </p>
        </div>
        <Toggle active={settings.ref_system_enabled === 'true'} onClick={()=>handleChange('ref_system_enabled', settings.ref_system_enabled === 'true' ? 'false' : 'true')} />
      </div>

      <div style={{opacity: settings.ref_system_enabled === 'true' ? 1 : 0.5, pointerEvents: settings.ref_system_enabled === 'true' ? 'auto' : 'none', transition: 'opacity 0.3s'}}>
        
        {/* NETWORK LEVEL THRESHOLDS */}
        <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,padding:'20px',marginBottom:16}}>
          <div style={{marginBottom:16}}>
            <h4 style={{color:'var(--text)',fontWeight:700,fontSize:15,margin:0}}>📈 Network Level Thresholds</h4>
            <p style={{color:'var(--dim)',fontSize:12,margin:'4px 0 0'}}>Define how many total direct referrals a user needs to reach each level.</p>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap: 12}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,255,255,0.02)', padding:'10px 14px', borderRadius:8}}>
              <span style={{color:'var(--text)', fontSize: 14, fontWeight:600}}>Level 2 Requirement:</span>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <input type="number" min="1" step="1" className="sgc-input" style={{width: 80, margin: 0, padding: '6px 10px'}} 
                  value={settings.level_1_refs_needed || ''} onChange={e=>handleChange('level_1_refs_needed', e.target.value)} />
                <span style={{color:'var(--dim)', fontSize:12}}>referrals</span>
              </div>
            </div>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,255,255,0.02)', padding:'10px 14px', borderRadius:8}}>
              <span style={{color:'var(--text)', fontSize: 14, fontWeight:600}}>Level 3 Requirement:</span>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <input type="number" min="1" step="1" className="sgc-input" style={{width: 80, margin: 0, padding: '6px 10px'}} 
                  value={settings.level_2_refs_needed || ''} onChange={e=>handleChange('level_2_refs_needed', e.target.value)} />
                <span style={{color:'var(--dim)', fontSize:12}}>referrals</span>
              </div>
            </div>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,255,255,0.02)', padding:'10px 14px', borderRadius:8}}>
              <span style={{color:'var(--text)', fontSize: 14, fontWeight:600}}>Level 4 (Max) Requirement:</span>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <input type="number" min="1" step="1" className="sgc-input" style={{width: 80, margin: 0, padding: '6px 10px'}} 
                  value={settings.level_3_refs_needed || ''} onChange={e=>handleChange('level_3_refs_needed', e.target.value)} />
                <span style={{color:'var(--dim)', fontSize:12}}>referrals</span>
              </div>
            </div>
          </div>
        </div>


        {/* REGISTRATION BONUS */}
        <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,padding:'20px',marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <h4 style={{color:'var(--text)',fontWeight:700,fontSize:15,margin:0}}>🎁 Registration Bonus (Fixed Amount)</h4>
              <p style={{color:'var(--dim)',fontSize:12,margin:'4px 0 0'}}>Awarded to the referrer instantly when someone signs up in their network.</p>
            </div>
            <Toggle active={settings.ref_reg_bonus_enabled === 'true'} onClick={()=>handleChange('ref_reg_bonus_enabled', settings.ref_reg_bonus_enabled === 'true' ? 'false' : 'true')} />
          </div>
          {settings.ref_reg_bonus_enabled === 'true' && renderLevels('ref_reg_bonus', 'Rs.', '')}
        </div>

        {/* PLAN PURCHASE BONUS */}
        <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,padding:'20px',marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <h4 style={{color:'var(--text)',fontWeight:700,fontSize:15,margin:0}}>💳 Plan Purchase Bonus (Percentage)</h4>
              <p style={{color:'var(--dim)',fontSize:12,margin:'4px 0 0'}}>Awarded to the referrer when someone in their network purchases a Membership Plan.</p>
            </div>
            <Toggle active={settings.ref_plan_bonus_enabled === 'true'} onClick={()=>handleChange('ref_plan_bonus_enabled', settings.ref_plan_bonus_enabled === 'true' ? 'false' : 'true')} />
          </div>
          {settings.ref_plan_bonus_enabled === 'true' && renderLevels('ref_plan_bonus', '%', 'Percentage of the plan price')}
        </div>

        {/* DEPOSIT BONUS */}
        <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,padding:'20px',marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <h4 style={{color:'var(--text)',fontWeight:700,fontSize:15,margin:0}}>💰 Add Fund (Deposit) Bonus (Percentage)</h4>
              <p style={{color:'var(--dim)',fontSize:12,margin:'4px 0 0'}}>Awarded to the referrer when a deposit is approved in their network.</p>
            </div>
            <Toggle active={settings.ref_deposit_bonus_enabled === 'true'} onClick={()=>handleChange('ref_deposit_bonus_enabled', settings.ref_deposit_bonus_enabled === 'true' ? 'false' : 'true')} />
          </div>
          {settings.ref_deposit_bonus_enabled === 'true' && renderLevels('ref_deposit_bonus', '%', 'Percentage of the deposit amount')}
        </div>

        {/* AD VIEW BONUS */}
        <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,padding:'20px',marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <h4 style={{color:'var(--text)',fontWeight:700,fontSize:15,margin:0}}>📺 Advertisement View Bonus (Percentage)</h4>
              <p style={{color:'var(--dim)',fontSize:12,margin:'4px 0 0'}}>Awarded to the referrer every time someone in their network finishes watching an Ad.</p>
            </div>
            <Toggle active={settings.ref_ad_bonus_enabled === 'true'} onClick={()=>handleChange('ref_ad_bonus_enabled', settings.ref_ad_bonus_enabled === 'true' ? 'false' : 'true')} />
          </div>
          {settings.ref_ad_bonus_enabled === 'true' && renderLevels('ref_ad_bonus', '%', 'Percentage of the Ad earning amount')}
        </div>

      </div>

      <button className="sgc-btn-primary" style={{marginTop: 16, width: 200}} onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : '💾 Save Settings'}
      </button>

    </div>
  );
}