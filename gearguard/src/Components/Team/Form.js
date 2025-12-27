import React, { useState, useEffect } from 'react';
import '../Team.css';

const TeamForm = ({ team, onSave, onUpdate, onClose }) => {
  const [formData, setFormData] = useState({ name: '', desc: '', members: [] });
  const [newMember, setNewMember] = useState('');

  useEffect(() => {
    if (team && team.maintenanceid) {
      setFormData({
        name: team.name || '',
        desc: team.desc || '',
        members: team.members || []
      });
    } else {
      setFormData({ name: '', desc: '', members: [] });
    }
    setNewMember('');
  }, [team]);

  const addMember = () => {
    if (newMember.trim()) {
      setFormData({ ...formData, members: [...(formData.members || []), newMember.trim()] });
      setNewMember('');
    }
  };

  const removeMember = (index) => {
    setFormData({ ...formData, members: formData.members.filter((_, i) => i !== index) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a team name');
      return;
    }
    if (team && team.maintenanceid) {
      onUpdate(team.maintenanceid, formData);
    } else {
      onSave(formData);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="team-form">
      <h2>{team && team.maintenanceid ? '✏️ Edit Team' : '➕ Add New Team'}</h2>
      
      <label>Team Name *</label>
      <input 
        placeholder="Enter team name" 
        value={formData.name || ''} 
        onChange={e => setFormData({ ...formData, name: e.target.value })} 
        required 
      />
      
      <label>Description</label>
      <input 
        placeholder="Enter team description" 
        value={formData.desc || ''} 
        onChange={e => setFormData({ ...formData, desc: e.target.value })} 
      />
      
      <div className="member-input-group">
        <div>
          <label>Add Team Members</label>
          <div className="add-member">
            <input 
              placeholder="Enter member name" 
              value={newMember} 
              onChange={e => setNewMember(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())}
            />
            <button type="button" onClick={addMember} className="btn-add-member">Add Member</button>
          </div>
        </div>
      </div>

      {formData.members && formData.members.length > 0 && (
        <div className="members-list">
          <h3>Team Members ({formData.members.length})</h3>
          <ul>
            {formData.members.map((member, index) => (
              <li key={index} className="member-item">
                <span>{index + 1}. {typeof member === 'string' ? member : member.name}</span>
                <button type="button" onClick={() => removeMember(index)} className="btn-remove">✕</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="form-buttons">
        <button type="submit" className="btn-primary">✓ {team && team.maintenanceid ? 'Update Team' : 'Create Team'}</button>
        <button type="button" onClick={onClose} className="btn-secondary">✕ Cancel</button>
      </div>
    </form>
  );
};

export default TeamForm;