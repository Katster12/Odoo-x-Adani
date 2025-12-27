import React from 'react';
import '../Team.css';

const TeamList = ({ teams, onEdit, onShowForm }) => (
  <div>
    <h2>👥 Maintenance Teams</h2>
    <button onClick={() => { onEdit({}); onShowForm(true); }} className="btn-add">+ Add New Team</button>
    <table>
      <thead>
        <tr>
          <th>Team Name</th>
          <th>Description</th>
          <th>Members</th>
          <th>Active Requests</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {teams.length === 0 ? (
          <tr>
            <td colSpan="5" style={{ textAlign: 'center', color: '#999' }}>No teams yet. Click "Add New Team" to create one.</td>
          </tr>
        ) : (
          teams.map(team => (
            <tr key={team.maintenanceid}>
              <td><strong>{team.name}</strong></td>
              <td>{team.desc || '-'}</td>
              <td>{team.memberCount || 0} members</td>
              <td>{team.assignedRequests || 0}</td>
              <td><button onClick={() => { onEdit(team); onShowForm(true); }} className="btn-edit">✏️ Edit</button></td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default TeamList;