import React, { useState, useEffect } from 'react';
import '../Request.css';

const RequestForm = ({ equipment, teams, onSave, onClose }) => {
  const [formData, setFormData] = useState({ type: 'Corrective', priority: 'MED' });

  useEffect(() => {
    if (formData.equipmentId) {
      const eq = equipment.find(e => e.id === formData.equipmentId);
      if (eq) {
        setFormData(prev => ({ 
          ...prev, 
          teamId: eq.maintenanceid, 
          category: eq.category || eq.deptname 
        }));
      }
    }
  }, [formData.equipmentId, equipment]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.equipmentId || !formData.scheduledDate) {
      alert('Please fill in all required fields');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="request-form">
      <h2>Create Maintenance Request</h2>
      
      <label>Request Type *</label>
      <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} required>
        <option value="Corrective">🔧 Corrective (Breakdown)</option>
        <option value="Preventive">📋 Preventive (Routine)</option>
      </select>

      <label>Priority *</label>
      <select value={formData.priority || 'MED'} onChange={e => setFormData({ ...formData, priority: e.target.value })} required>
        <option value="HIGH">🔴 High</option>
        <option value="MED">🟡 Medium</option>
        <option value="LOW">🟢 Low</option>
      </select>
      
      <label>Subject *</label>
      <input 
        placeholder="Brief description of the request" 
        value={formData.subject || ''} 
        onChange={e => setFormData({ ...formData, subject: e.target.value })} 
        required 
      />
      
      <label>Select Equipment *</label>
      <select value={formData.equipmentId || ''} onChange={e => setFormData({ ...formData, equipmentId: parseInt(e.target.value) })} required>
        <option value="">-- Select Equipment --</option>
        {equipment.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
      </select>
      
      <div className="info-box">
        <p><strong>Category:</strong> {formData.category || 'Not selected'}</p>
        <p><strong>Assigned Team:</strong> {formData.teamId || 'Not assigned'}</p>
      </div>
      
      <label>Scheduled Date *</label>
      <input 
        type="date" 
        value={formData.scheduledDate || ''} 
        onChange={e => setFormData({ ...formData, scheduledDate: e.target.value })} 
        required 
      />
      
      <label>Duration (hours)</label>
      <input 
        type="number" 
        placeholder="Estimated duration" 
        value={formData.duration || ''} 
        onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) || '' })} 
      />
      
      <label>Description</label>
      <textarea 
        placeholder="Additional details..." 
        value={formData.description || ''} 
        onChange={e => setFormData({ ...formData, description: e.target.value })}
        rows="4"
      />
      
      <div className="form-buttons">
        <button type="submit" className="btn-primary">✓ Create Request</button>
        <button type="button" onClick={onClose} className="btn-secondary">✕ Cancel</button>
      </div>
    </form>
  );
};

export default RequestForm;