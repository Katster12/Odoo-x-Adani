import React from 'react';
import '../Equipment.css';

const EquipmentList = ({ equipment, onEdit, onShowForm }) => (
  <div>
    <h2>⚙️ Equipment Management</h2>
    <button onClick={() => { onEdit({}); onShowForm(true); }} className="btn-add">+ Add New Equipment</button>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Serial</th>
          <th>Category</th>
          <th>Department</th>
          <th>Location</th>
          <th>Team</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {equipment.length === 0 ? (
          <tr>
            <td colSpan="7" style={{ textAlign: 'center', color: '#999' }}>No equipment yet. Click "Add New Equipment" to register one.</td>
          </tr>
        ) : (
          equipment.map(eq => (
            <tr key={eq.id}>
              <td><strong>{eq.name}</strong></td>
              <td>{eq.srno}</td>
              <td>{eq.category || '-'}</td>
              <td>{eq.deptname || '-'}</td>
              <td>{eq.location || '-'}</td>
              <td>{eq.teamName || '-'}</td>
              <td><button onClick={() => { onEdit(eq); onShowForm(true); }} className="btn-edit">✏️ Edit</button></td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default EquipmentList;