import React, { useState, useEffect } from 'react';
import '../Equipment.css';

const EquipmentForm = ({ equipment, onSave, onUpdate, onClose, requests, onScrap }) => {
  const [formData, setFormData] = useState({ active: true });

  useEffect(() => {
    if (equipment && equipment.id) {
      setFormData({
        name: equipment.name || '',
        serial: equipment.srno || '',
        location: equipment.location || '',
        department: equipment.deptname || '',
        purchaseDate: equipment.purchasedate || '',
        warranty: equipment.warrentyenddate || '',
        teamId: equipment.maintenanceid || '',
        category: equipment.category || '',
        active: true
      });
    } else {
      setFormData({ active: true });
    }
  }, [equipment]);

  const openRequestsCount = requests.filter(r => 
    r.equipmentid === equipment?.id && 
    r.stage !== 'REPAIRED' && 
    r.stage !== 'Repaired' && 
    r.stage !== 'SCRAP' && 
    r.stage !== 'Scrap'
  ).length;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.serial || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }
    if (equipment && equipment.id) {
      onUpdate(equipment.id, formData);
    } else {
      onSave(formData);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="equipment-form">
      <h2>{equipment && equipment.id ? '✏️ Edit Equipment' : '➕ Add New Equipment'}</h2>
      
      <label>Equipment Name *</label>
      <input 
        placeholder="Enter equipment name" 
        value={formData.name || ''} 
        onChange={e => setFormData({ ...formData, name: e.target.value })} 
        required 
      />
      
      <label>Serial Number *</label>
      <input 
        placeholder="Enter serial number" 
        value={formData.serial || ''} 
        onChange={e => setFormData({ ...formData, serial: e.target.value })} 
        required 
      />
      
      <label>Location *</label>
      <input 
        placeholder="Enter equipment location" 
        value={formData.location || ''} 
        onChange={e => setFormData({ ...formData, location: e.target.value })} 
        required 
      />

      <label>Category</label>
      <input 
        placeholder="Equipment category" 
        value={formData.category || ''} 
        onChange={e => setFormData({ ...formData, category: e.target.value })} 
      />
      
      <label>Department/Employee</label>
      <input 
        placeholder="Department or employee name" 
        value={formData.department || ''} 
        onChange={e => setFormData({ ...formData, department: e.target.value })} 
      />
      
      <label>Purchase Date</label>
      <input 
        type="date" 
        value={formData.purchaseDate || ''} 
        onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })} 
      />
      
      <label>Warranty End Date</label>
      <input 
        type="date"
        value={formData.warranty || ''} 
        onChange={e => setFormData({ ...formData, warranty: e.target.value })} 
      />
      
      <label>Assigned Team</label>
      <select value={formData.teamId || ''} onChange={e => setFormData({ ...formData, teamId: parseInt(e.target.value) || '' })}>
        <option value="">-- Select Team --</option>
        <option value={1}>👷 Mechanics</option>
        <option value={2}>⚡ Electricians</option>
        <option value={3}>💻 IT Support</option>
      </select>
      
      {equipment?.id && (
        <div className="info-box">
          <p><strong>Open Maintenance Requests:</strong> {openRequestsCount}</p>
        </div>
      )}
      
      <div className="form-buttons">
        <button type="submit" className="btn-primary">✓ {equipment && equipment.id ? 'Update Equipment' : 'Add Equipment'}</button>
        {equipment && equipment.id && (
          <button type="button" onClick={() => { 
            if (window.confirm('Are you sure you want to delete this equipment?')) {
              onScrap(equipment.id); 
              onClose(); 
            }
          }} className="btn-danger">🗑️ Delete</button>
        )}
        <button type="button" onClick={onClose} className="btn-secondary">✕ Cancel</button>
      </div>
    </form>
  );
};

export default EquipmentForm;