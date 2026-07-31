/* eslint-disable */
import React, { useState, useEffect } from 'react';
import API from '../../api';

export default function Plans({ notify, loadData }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editPlan, setEditPlan] = useState(null);
  const [newPlan, setNewPlan] = useState({ name:'', price:'', description:'', duration_days:'', min_withdraw:'', earning_per_click:'', referral_levels:'' });

  const fetchPlans = async () => {
    try {
      const res = await API.get('/admin/plans');
      setPlans(res.data);
    } catch (e) {
      console.error(e);
      if (notify) notify('Failed to fetch plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const addPlan = async (e) => {
    e.preventDefault();
    try {
      if (editPlan) {
        await API.put(`/admin/plans/${editPlan.id}`, newPlan);
        setEditPlan(null);
      } else {
        await API.post('/admin/plans', newPlan);
      }
      setNewPlan({ name:'', price:'', description:'', duration_days:'', min_withdraw:'', earning_per_click:'', referral_levels:'' });
      fetchPlans();
      if (loadData) loadData();
      if (notify) notify(editPlan ? 'Plan updated ✅' : 'Plan added ✅');
    } catch (err) {
      if (notify) notify('Error saving plan', 'error');
    }
  };

  const handleEdit = (plan) => {
    setEditPlan(plan);
    setNewPlan({ 
      name: plan.name, 
      price: plan.price, 
      description: plan.description, 
      duration_days: plan.duration_days, 
      min_withdraw: plan.min_withdraw, 
      earning_per_click: plan.earning_per_click, 
      referral_levels: plan.referral_levels 
    });
  };

  const deletePlan = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await API.delete(`/admin/plans/${id}`);
      fetchPlans();
      if (loadData) loadData();
      if (notify) notify('Plan deleted');
    } catch (e) {
      if (notify) notify('Error deleting plan', 'error');
    }
  };

  

  return (
    <div>
      <div className="sgc-page-header">
        <h2 className="sgc-heading">🏆 Plans</h2>
      </div>

      {/* Add/Edit Plan Form */}
      <form onSubmit={addPlan} className="sgc-form" style={{maxWidth:520,marginBottom:24}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div>
            <label className="sgc-label">Plan Name</label>
            <input className="sgc-input" value={newPlan.name} onChange={e=>setNewPlan({...newPlan,name:e.target.value})} required/>
          </div>
          <div>
            <label className="sgc-label">Price (Rs.)</label>
            <input className="sgc-input" type="number" step="0.01" value={newPlan.price} onChange={e=>setNewPlan({...newPlan,price:e.target.value})} required/>
          </div>
        </div>
        <label className="sgc-label">Description</label>
        <textarea className="sgc-input" rows={2} value={newPlan.description} onChange={e=>setNewPlan({...newPlan,description:e.target.value})}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div>
            <label className="sgc-label">Duration (days)</label>
            <input className="sgc-input" type="number" value={newPlan.duration_days} onChange={e=>setNewPlan({...newPlan,duration_days:e.target.value})} required/>
          </div>
          <div>
            <label className="sgc-label">Min Withdraw (Rs.)</label>
            <input className="sgc-input" type="number" step="0.01" value={newPlan.min_withdraw} onChange={e=>setNewPlan({...newPlan,min_withdraw:e.target.value})} required/>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div>
            <label className="sgc-label">Earning Per Click (Rs.)</label>
            <input className="sgc-input" type="number" step="0.01" value={newPlan.earning_per_click} onChange={e=>setNewPlan({...newPlan,earning_per_click:e.target.value})} required/>
          </div>
          <div>
            <label className="sgc-label">Referral Levels</label>
            <input className="sgc-input" type="number" value={newPlan.referral_levels} onChange={e=>setNewPlan({...newPlan,referral_levels:e.target.value})} required/>
          </div>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button className="sgc-btn-yellow" type="submit">{editPlan?'Update Plan':'Add Plan'}</button>
          {editPlan&&<button type="button" className="sgc-btn-sm" style={{padding:13,borderRadius:10,background:'var(--border)',color:'var(--text)'}} onClick={()=>{setEditPlan(null);setNewPlan({name:'',price:'',description:'',duration_days:'',min_withdraw:'',earning_per_click:'',referral_levels:''});}}>Cancel</button>}
        </div>
      </form>

      {/* Plans Table */}
      <div className="sgc-table-wrap">
        <table className="sgc-table">
          <thead><tr>
            <th className="sgc-th">Name</th><th className="sgc-th">Price</th><th className="sgc-th">Duration</th>
            <th className="sgc-th">Min Withdraw</th><th className="sgc-th">Earning/Click</th><th className="sgc-th">Ref Levels</th><th className="sgc-th">Actions</th>
          </tr></thead>
          <tbody>{plans.map(p=>(
            <tr key={p.id} className="sgc-tr">
              <td className="sgc-td" style={{color:'var(--text)',fontWeight:600}}>{p.name}</td>
              <td className="sgc-td" style={{color:'var(--green)',fontWeight:700}}>Rs. {p.price}</td>
              <td className="sgc-td">{p.duration_days} days</td>
              <td className="sgc-td" style={{color:'var(--yellow)',fontWeight:600}}>Rs. {p.min_withdraw}</td>
              <td className="sgc-td" style={{color:'var(--accent)',fontWeight:600}}>Rs. {p.earning_per_click}</td>
              <td className="sgc-td">{p.referral_levels}</td>
              <td className="sgc-td" style={{display:'flex',gap:6}}>
                <button className="sgc-btn-sm" style={{background:'#451a03',color:'var(--yellow)'}} onClick={()=>handleEdit(p)}>Edit</button>
                <button className="sgc-btn-sm" style={{background:'#450a0a',color:'#fca5a5'}} onClick={()=>deletePlan(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {plans.length===0&&<tr><td colSpan={7} className="sgc-td" style={{textAlign:'center',padding:32}}>No plans yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}