import React, { useState, useEffect } from 'react';
import API from '../../api';

export default function RegistrationBonus({ notify }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [enabled, setEnabled] = useState(false);
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await API.get('/admin/settings');
      const settings = res.data.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      
      setEnabled(settings.registration_bonus_enabled === 'true');
      setAmount(parseFloat(settings.registration_bonus) || 0);
    } catch (err) {
      console.error(err);
      notify('Failed to load registration bonus settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.post('/admin/settings/registration_bonus_enabled', { value: enabled ? 'true' : 'false' });
      await API.post('/admin/settings/registration_bonus', { value: amount.toString() });
      notify('Registration Bonus settings updated successfully!');
    } catch (err) {
      console.error(err);
      notify('Failed to update settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color: 'var(--text)' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 800 }}>
      <h2 className="sgc-heading" style={{ marginBottom: 20 }}>🎁 Platform Registration Bonus</h2>
      <p style={{ color: 'var(--dim)', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
        This bonus is given to <b>any new user</b> who registers on the platform (whether they come through a referral link or directly to the website). The amount will be added to their balance immediately upon signup.
      </p>

      <div style={{ background: 'var(--card)', padding: 24, borderRadius: 16, border: '1px solid var(--border)' }}>
        
        {/* Toggle Switch */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
          <div>
            <h3 style={{ margin: '0 0 8px', color: 'var(--text)', fontSize: 16 }}>Enable Registration Bonus</h3>
            <p style={{ margin: 0, color: 'var(--dim)', fontSize: 13 }}>
              {enabled ? 'New users WILL receive a bonus when they sign up.' : 'New users will NOT receive any sign up bonus.'}
            </p>
          </div>
          
          {/* Custom Toggle UI */}
          <div 
            onClick={() => setEnabled(!enabled)}
            style={{
              width: 50, height: 26, background: enabled ? 'var(--accent)' : 'var(--bg)',
              borderRadius: 30, position: 'relative', cursor: 'pointer', transition: 'background .3s',
              border: enabled ? 'none' : '1px solid var(--border)'
            }}
          >
            <div style={{
              width: 22, height: 22, background: '#fff', borderRadius: '50%',
              position: 'absolute', top: enabled ? 2 : 1, left: enabled ? 26 : 2,
              transition: 'left .3s', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }} />
          </div>
        </div>

        {/* Amount Input */}
        <div style={{ opacity: enabled ? 1 : 0.5, pointerEvents: enabled ? 'auto' : 'none', transition: 'opacity .3s' }}>
          <label style={{ display: 'block', color: 'var(--muted)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
            BONUS AMOUNT (RS.)
          </label>
          <input 
            type="number" 
            min="0"
            className="sgc-input" 
            style={{ width: '100%', maxWidth: 300, marginBottom: 24 }}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Save Button */}
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="sgc-button"
          style={{ width: '100%', maxWidth: 300, opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        
      </div>
    </div>
  );
}
