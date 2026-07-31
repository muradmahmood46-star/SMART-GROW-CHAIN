import React, { useState, useEffect } from 'react';
import API from '../../api';

export default function Users({ notify }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceUser, setBalanceUser] = useState(null);
  const [balanceAmount, setBalanceAmount] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      if (notify) notify('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUser = async (id) => {
    try {
      await API.put(`/admin/users/${id}/toggle`);
      fetchUsers();
      if (notify) notify('User status updated');
    } catch (e) {
      console.error(e);
      if (notify) notify('Error updating user', 'error');
    }
  };

  const openBalanceModal = (u) => {
    setBalanceUser(u);
    setBalanceAmount('');
    setShowBalanceModal(true);
  };

  const updateBalance = async () => {
    if (!balanceUser) return;
    try {
      await API.put(`/admin/users/${balanceUser.id}/balance`, { balance: parseFloat(balanceAmount) });
      setShowBalanceModal(false);
      fetchUsers();
      if (notify) notify('Balance updated ✅');
    } catch (e) {
      console.error(e);
      if (notify) notify('Error updating balance', 'error');
    }
  };

  if (loading) {
    return <div style={{padding: 20, color: 'var(--dim)'}}>Loading users...</div>;
  }

  return (
    <div>
      <div className="sgc-page-header">
        <h2 className="sgc-heading">👥 Users</h2>
        <span style={{color:'var(--dim)',fontSize:13,background:'var(--card)',padding:'4px 12px',borderRadius:20,border:'1px solid var(--border)'}}>{users.length} total</span>
      </div>
      <div className="sgc-table-wrap">
        <table className="sgc-table">
          <thead><tr>
            <th className="sgc-th">Username</th><th className="sgc-th">Email</th>
            <th className="sgc-th">Balance</th><th className="sgc-th">Earned</th>
            <th className="sgc-th">Plan</th><th className="sgc-th">Status</th><th className="sgc-th">Actions</th>
          </tr></thead>
          <tbody>{users.map(u=>(
            <tr key={u.id} className="sgc-tr">
              <td className="sgc-td" style={{color:'var(--text)',fontWeight:700}}>{u.username}</td>
              <td className="sgc-td">{u.email}</td>
              <td className="sgc-td" style={{color:'var(--green)',fontWeight:600}}>Rs. {u.balance.toFixed(2)}</td>
              <td className="sgc-td">Rs. {u.total_earned.toFixed(2)}</td>
              <td className="sgc-td"><span className="sgc-badge" style={{background:'#1e3a6e'}}>{u.membership}</span></td>
              <td className="sgc-td"><span className="sgc-badge" style={{background:u.is_active?'#064e3b':'#450a0a'}}>{u.is_active?'Active':'Blocked'}</span></td>
              <td className="sgc-td" style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                <button className="sgc-btn-sm" style={{background:'var(--border)',color:'var(--muted)'}} onClick={()=>toggleUser(u.id)}>{u.is_active?'Block':'Unblock'}</button>
                <button className="sgc-btn-sm" style={{background:'#451a03',color:'var(--yellow)'}} onClick={()=>openBalanceModal(u)}>Balance</button>
              </td>
            </tr>
          ))}
          {users.length===0&&<tr><td colSpan={7} className="sgc-td" style={{textAlign:'center',padding:32}}>No users found</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Balance Modal */}
      {showBalanceModal && (
        <div className="sgc-modal-overlay" onClick={()=>setShowBalanceModal(false)}>
          <div className="sgc-modal" onClick={e=>e.stopPropagation()} style={{maxWidth:420,width:'90%'}}>
            <h3 style={{color:'var(--text)',marginBottom:12,fontSize:15,fontWeight:700}}>Update Balance</h3>
            <p style={{color:'var(--dim)',fontSize:12,marginBottom:12}}>User: <b>{balanceUser?.username}</b></p>
            <input className="sgc-input" type="number" step="0.01" placeholder="Enter new balance" value={balanceAmount} onChange={e=>setBalanceAmount(e.target.value)} autoFocus/>
            <div style={{display:'flex',gap:10,marginTop:12}}>
              <button className="sgc-btn-yellow" style={{flex:1}} onClick={updateBalance}>Update</button>
              <button className="sgc-btn-sm" style={{flex:1,background:'var(--border)',color:'var(--text)',padding:11,borderRadius:10}} onClick={()=>setShowBalanceModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}