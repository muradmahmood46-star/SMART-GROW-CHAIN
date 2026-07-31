import React from 'react';

export default function Users({ users, toggleUser, setBalanceModal }) {
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
                <button className="sgc-btn-sm" style={{background:'#451a03',color:'var(--yellow)'}} onClick={()=>setBalanceModal(u)}>Balance</button>
              </td>
            </tr>
          ))}
          {users.length===0&&<tr><td colSpan={7} className="sgc-td" style={{textAlign:'center',padding:32}}>No users found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}