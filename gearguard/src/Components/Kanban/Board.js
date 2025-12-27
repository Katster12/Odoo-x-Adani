import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import '../Kanban.css';

const KanbanBoard = ({ requests, onUpdate, equipment }) => {
  const stages = ['New', 'In Progress', 'Repaired', 'Scrap'];
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editData, setEditData] = useState(null);

  const normalizeStage = (stage) => {
    const stageMap = {
      'NEW': 'New',
      'IN_PROGRESS': 'In Progress',
      'REPAIRED': 'Repaired',
      'SCRAP': 'Scrap'
    };
    return stageMap[stage] || stage;
  };

  const getRequestsByStage = (stage) => requests.filter(r => normalizeStage(r.stage) === stage);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId !== destination.droppableId) {
      const reqId = parseInt(draggableId.replace('req-', ''));
      onUpdate(reqId, { stage: destination.droppableId });
    }
  };

  const isOverdue = (req) => {
    if (!req.scheduleddate) return false;
    return new Date(req.scheduleddate) < new Date() && 
           (normalizeStage(req.stage) === 'New' || req.stage === 'NEW');
  };

  const getEquipmentName = (id) => {
    const eq = equipment.find(e => e.id === id);
    return eq ? eq.name : (id ? `Equipment #${id}` : 'Unknown');
  };

  const handleEditRequest = (req) => {
    setSelectedRequest(req);
    setEditData({ 
      ...req, 
      stage: normalizeStage(req.stage),
      type: req.type === 'CORRECTIVE' ? 'Corrective' : 'Preventive',
      scheduledDate: req.scheduleddate ? req.scheduleddate.split('T')[0] : ''
    });
  };

  const handleUpdateRequest = () => {
    if (!editData.subject || !editData.stage) {
      alert('Please fill in all required fields');
      return;
    }
    onUpdate(selectedRequest.reqid, editData);
    setSelectedRequest(null);
    setEditData(null);
  };

  const handleCloseDetails = () => {
    setSelectedRequest(null);
    setEditData(null);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <h2>📊 Kanban Board</h2>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>Drag cards to change status or click to edit details</p>
      
      {selectedRequest && editData && (
        <div className="kanban-details-panel">
          <div className="details-content">
            <h3>🔍 Edit Request Details</h3>
            
            <label>Subject *</label>
            <input 
              value={editData.subject || ''} 
              onChange={e => setEditData({ ...editData, subject: e.target.value })}
              placeholder="Request subject"
            />
            
            <label>Status *</label>
            <select 
              value={editData.stage || ''} 
              onChange={e => setEditData({ ...editData, stage: e.target.value })}
            >
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Repaired">Repaired</option>
              <option value="Scrap">Scrap</option>
            </select>
            
            <label>Type</label>
            <select 
              value={editData.type || ''} 
              onChange={e => setEditData({ ...editData, type: e.target.value })}
            >
              <option value="Corrective">Corrective</option>
              <option value="Preventive">Preventive</option>
            </select>
            
            <label>Scheduled Date</label>
            <input 
              type="date"
              value={editData.scheduledDate || ''} 
              onChange={e => setEditData({ ...editData, scheduledDate: e.target.value })}
            />
            
            <label>Duration (hours)</label>
            <input 
              type="number"
              value={editData.duration || editData.hoursspent || ''} 
              onChange={e => setEditData({ ...editData, duration: parseInt(e.target.value) || '' })}
              placeholder="Duration"
            />
            
            <label>Notes</label>
            <textarea 
              value={editData.notes || editData.description || ''} 
              onChange={e => setEditData({ ...editData, notes: e.target.value })}
              placeholder="Additional notes"
              rows="3"
            />
            
            <div className="details-buttons">
              <button onClick={handleUpdateRequest} className="btn-save">✓ Update Request</button>
              <button onClick={handleCloseDetails} className="btn-cancel">✕ Close</button>
            </div>
          </div>
        </div>
      )}
      
      <div style={{ display: 'flex', overflowX: 'auto', gap: '1rem' }}>
        {stages.map(stage => (
          <Droppable droppableId={stage} key={stage}>
            {(provided, snapshot) => (
              <div 
                className={`kanban-column ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                ref={provided.innerRef} 
                {...provided.droppableProps}
              >
                <h3>{stage}</h3>
                <p className="stage-count">{getRequestsByStage(stage).length} items</p>
                {getRequestsByStage(stage).map((req, index) => (
                  <Draggable draggableId={`req-${req.reqid}`} index={index} key={req.reqid}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`kanban-card ${isOverdue(req) ? 'overdue' : ''} ${snapshot.isDragging ? 'dragging' : ''}`}
                        onClick={() => handleEditRequest(req)}
                      >
                        <div className="card-header">
                          <h4>{req.subject || 'Untitled'}</h4>
                          <span className="type-badge">
                            {req.type === 'CORRECTIVE' ? 'Corrective' : 
                             req.type === 'PREVENTIVE' ? 'Preventive' : req.type}
                          </span>
                        </div>
                        <p className="card-equipment">🔧 {getEquipmentName(req.equipmentid)}</p>
                        <p className="card-date">📅 {req.scheduleddate ? new Date(req.scheduleddate).toLocaleDateString() : 'No date'}</p>
                        {req.hoursspent && <p className="card-duration">⏱️ {req.hoursspent}h</p>}
                        {isOverdue(req) && <span className="overdue-badge">⚠️ Overdue</span>}
                        <p className="click-hint">Click to edit →</p>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;