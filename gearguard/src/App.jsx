import React, { useState, useEffect } from 'react';
import { Calendar, BarChart3, Plus, Users, Wrench, Clock, AlertCircle, Settings, X, Edit2, Trash2, Search, Filter, Menu, ChevronLeft } from 'lucide-react';
import './App.css';

const GearGuardApp = () => {
  const [activeModule, setActiveModule] = useState('requests');
  const [activeView, setActiveView] = useState('kanban');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  // Equipment Data
  const [equipment, setEquipment] = useState([
    {
      id: 1,
      name: 'CNC Machine #045',
      serialNumber: 'CNC-2024-045',
      category: 'Production Equipment',
      department: 'Production',
      employee: 'John Doe',
      maintenanceTeam: 'Mechanics',
      technician: 'John Smith',
      purchaseDate: '2023-05-15',
      warrantyExpiry: '2026-05-15',
      location: 'Factory Floor A',
      status: 'Active',
      openRequests: 2
    },
    {
      id: 2,
      name: 'Printer 01',
      serialNumber: 'PRT-2024-001',
      category: 'Office Equipment',
      department: 'Administration',
      employee: 'Jane Smith',
      maintenanceTeam: 'IT Support',
      technician: 'Sarah Johnson',
      purchaseDate: '2024-01-10',
      warrantyExpiry: '2027-01-10',
      location: 'Office Building B',
      status: 'Active',
      openRequests: 1
    },
    {
      id: 3,
      name: 'Laptop #234',
      serialNumber: 'LPT-2024-234',
      category: 'IT Equipment',
      department: 'IT',
      employee: 'Mike Davis',
      maintenanceTeam: 'IT Support',
      technician: 'Mike Davis',
      purchaseDate: '2024-03-20',
      warrantyExpiry: '2027-03-20',
      location: 'Office Building A',
      status: 'Active',
      openRequests: 0
    }
  ]);

  // Teams Data
  const [teams, setTeams] = useState([
    {
      id: 1,
      name: 'Mechanics',
      members: ['John Smith', 'Robert Brown', 'David Wilson'],
      specialization: 'Mechanical Equipment',
      activeRequests: 3
    },
    {
      id: 2,
      name: 'Electricians',
      members: ['Tom Wilson', 'James Lee'],
      specialization: 'Electrical Systems',
      activeRequests: 2
    },
    {
      id: 3,
      name: 'IT Support',
      members: ['Sarah Johnson', 'Mike Davis', 'Emily Chen'],
      specialization: 'IT Equipment & Software',
      activeRequests: 2
    }
  ]);

  // Maintenance Requests Data
  const [requests, setRequests] = useState([
    {
      id: 1,
      subject: 'Leaking Oil',
      equipment: 'CNC Machine #045',
      equipmentId: 1,
      category: 'Production Equipment',
      team: 'Mechanics',
      technician: { name: 'John Smith', avatar: 'JS' },
      type: 'Corrective',
      stage: 'new',
      priority: 'high',
      scheduledDate: '2025-01-05',
      createdDate: '2024-12-20',
      duration: null,
      description: 'Oil leaking from main hydraulic system',
      isOverdue: true
    },
    {
      id: 2,
      subject: 'Routine Checkup',
      equipment: 'Printer 01',
      equipmentId: 2,
      category: 'Office Equipment',
      team: 'IT Support',
      technician: { name: 'Sarah Johnson', avatar: 'SJ' },
      type: 'Preventive',
      stage: 'new',
      priority: 'low',
      scheduledDate: '2025-12-30',
      createdDate: '2024-12-25',
      duration: null,
      description: 'Monthly maintenance checkup',
      isOverdue: false
    },
    {
      id: 3,
      subject: 'Software Update',
      equipment: 'Laptop #234',
      equipmentId: 3,
      category: 'IT Equipment',
      team: 'IT Support',
      technician: { name: 'Mike Davis', avatar: 'MD' },
      type: 'Preventive',
      stage: 'in-progress',
      priority: 'medium',
      scheduledDate: '2025-12-28',
      createdDate: '2024-12-27',
      duration: null,
      description: 'System software update and security patches',
      isOverdue: false
    },
    {
      id: 4,
      subject: 'Electrical Fault Fixed',
      equipment: 'Conveyor Belt #12',
      equipmentId: 1,
      category: 'Production Equipment',
      team: 'Electricians',
      technician: { name: 'Tom Wilson', avatar: 'TW' },
      type: 'Corrective',
      stage: 'repaired',
      priority: 'high',
      scheduledDate: '2025-12-20',
      createdDate: '2024-12-18',
      duration: '3.5 hours',
      description: 'Repaired motor control circuit',
      isOverdue: false
    }
  ]);

  const stages = [
    { id: 'new', name: 'New', color: 'bg-blue-50 border-blue-200' },
    { id: 'in-progress', name: 'In Progress', color: 'bg-yellow-50 border-yellow-200' },
    { id: 'repaired', name: 'Repaired', color: 'bg-green-50 border-green-200' },
    { id: 'scrap', name: 'Scrap', color: 'bg-red-50 border-red-200' }
  ];

  const handleDragStart = (e, requestId) => {
    e.dataTransfer.setData('requestId', requestId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    const requestId = parseInt(e.dataTransfer.getData('requestId'));
    setRequests(requests.map(req => 
      req.id === requestId ? { ...req, stage: targetStage } : req
    ));
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  // close modal on Escape for accessibility
  useEffect(() => {
    if (!showModal) return;
    const handler = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showModal]);

  // Equipment List View
  const EquipmentList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
            <input
              type="text"
              placeholder="Search equipment..."
              className="pl-10 pr-4 py-2 bg-[#07121a] border border-white/6 rounded-md w-96 text-white"
            />
          </div>
          <button className="btn-ghost flex items-center gap-2">
            <Filter size={18} />
            Filter
          </button>
        </div>
        <button 
          onClick={() => openModal('equipment')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus size={18} />
          Add Equipment
        </button>
      </div>

      <div className="card-panel overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Maintenance Team</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {equipment.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    {item.openRequests > 0 && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        {item.openRequests} open
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.serialNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.department}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.employee}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.maintenanceTeam}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.location}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openModal('equipment', item)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Edit2 size={16} className="text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Teams List View
  const TeamsList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Maintenance Teams</h2>
        <button 
          onClick={() => openModal('team')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus size={18} />
          Add Team
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => (
          <div key={team.id} className="card-panel p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{team.specialization}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openModal('team', team)} className="p-1 hover:bg-gray-100 rounded">
                  <Edit2 size={16} className="text-gray-600" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Trash2 size={16} className="text-red-600" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Team Members:</div>
                <div className="flex flex-wrap gap-2">
                  {team.members.map((member, idx) => (
                    <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">
                      {member}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Active Requests:</span>
                  <span className="font-semibold text-gray-900">{team.activeRequests}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Kanban View (modern, professional look)
  const KanbanView = () => (
    <div className="flex gap-8 overflow-x-auto pb-8 px-2 kanban-bg">
      {stages.map(stage => (
        <div
          key={stage.id}
          className="flex-shrink-0 w-96"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, stage.id)}
        >
          <div className={`kanban-col-bg p-6 rounded-2xl shadow-xl border border-white/10 min-h-[380px] flex flex-col transition-all duration-200`}> 
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-extrabold text-2xl text-white tracking-tight">{stage.name}</h3>
              <span className="bg-indigo-600/90 px-4 py-1 rounded-full text-base font-bold text-white shadow-sm">
                {requests.filter(r => r.stage === stage.id).length}
              </span>
            </div>
            <div className="flex flex-col gap-6">
              {requests.filter(r => r.stage === stage.id).map(request => (
                <div
                  key={request.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, request.id)}
                  onClick={() => openModal('request', request)}
                  className="kanban-card bg-white/5 rounded-xl border border-white/10 p-5 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 group"
                  style={{ boxShadow: '0 4px 24px 0 rgba(46,55,255,0.08)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {request.isOverdue && (
                        <span className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-100/10 px-2 py-0.5 rounded-full"><AlertCircle size={13}/>OVERDUE</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg shadow ${
                        request.priority === 'high' ? 'bg-red-600 text-white' : request.priority === 'medium' ? 'bg-yellow-500 text-white' : 'bg-green-600 text-white'
                      }`}>
                        {request.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-300 font-semibold">{request.scheduledDate}</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-lg text-white mb-1 truncate">{request.subject}</h4>
                  <div className="text-sm text-indigo-200 mb-2">{request.equipment} <span className="mx-1 text-gray-500">•</span> {request.team}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                    <Wrench size={13} />
                    <span>{request.category}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                    <Users size={13} />
                    <span>{request.technician.name}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      request.type === 'Corrective' ? 'bg-red-100/80 text-red-700' : 'bg-blue-100/80 text-blue-700'
                    }`}>
                      {request.type}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold border-2 border-white/20">
                        {request.technician.avatar}
                      </div>
                    </div>
                  </div>
                  {request.duration && (
                    <div className="mt-2 text-xs text-gray-400 font-semibold">
                      Duration: {request.duration}
                    </div>
                  )}
                </div>
              ))}
              {requests.filter(r => r.stage === stage.id).length === 0 && (
                <div className="text-center text-gray-500 py-8 text-base">No requests</div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Calendar View
  const CalendarView = () => {
    const daysInMonth = 31;
    const firstDay = 3;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const preventiveRequests = requests.filter(r => r.type === 'Preventive');
    
    return (
      <div className="card-panel p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">December 2025</h2>
          <button 
            onClick={() => openModal('request')}
            className="btn-primary"
          >
            <Plus size={18} />
            New Request
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {days.map(day => (
            <div key={day} className="text-center font-semibold text-gray-700 py-2">
              {day}
            </div>
          ))}
          
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square"></div>
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const date = i + 1;
            const dateStr = `2025-12-${date.toString().padStart(2, '0')}`;
            const dayRequests = preventiveRequests.filter(r => r.scheduledDate === dateStr);
            
            return (
              <div
                key={date}
                className="aspect-square border border-gray-200 rounded-lg p-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => openModal('request')}
              >
                <div className="font-medium text-gray-900">{date}</div>
                {dayRequests.map(req => (
                  <div key={req.id} className="mt-1 text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5 truncate">
                    {req.equipment}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Report View
  const ReportView = () => {
    const teamStats = requests.reduce((acc, req) => {
      acc[req.team] = (acc[req.team] || 0) + 1;
      return acc;
    }, {});
    
    const categoryStats = requests.reduce((acc, req) => {
      acc[req.category] = (acc[req.category] || 0) + 1;
      return acc;
    }, {});
    
    return (
      <div className="space-y-6">
        <div className="card-panel p-6">
          <h3 className="text-xl font-bold mb-4 text-white">Requests per Team</h3>
          <div className="space-y-3">
            {Object.entries(teamStats).map(([team, count]) => (
              <div key={team} className="flex items-center gap-4">
                <div className="w-40 font-medium text-gray-700">{team}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-8">
                  <div 
                    className="bg-indigo-600 h-8 rounded-full flex items-center justify-end pr-3 text-white text-sm font-medium"
                    style={{ width: `${(count / requests.length) * 100}%` }}
                  >
                    {count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card-panel p-6">
          <h3 className="text-xl font-bold mb-4 text-white">Requests per Category</h3>
          <div className="space-y-3">
            {Object.entries(categoryStats).map(([category, count]) => (
              <div key={category} className="flex items-center gap-4">
                <div className="w-40 font-medium text-gray-700">{category}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-8">
                  <div 
                    className="bg-green-600 h-8 rounded-full flex items-center justify-end pr-3 text-white text-sm font-medium"
                    style={{ width: `${(count / requests.length) * 100}%` }}
                  >
                    {count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };


  // Modal Component (glassmorphism, animation, improved layout)
  const Modal = () => {
    if (!showModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-fade" role="dialog" aria-modal="true">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px] transition-opacity duration-300" onClick={closeModal} />
        <div className="relative card-panel max-w-2xl w-full max-h-[90vh] overflow-y-auto glass-modal animate-modalIn shadow-2xl border border-white/10">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-2xl font-extrabold text-white">
              {modalType === 'equipment' && (selectedItem ? 'Edit Equipment' : 'New Equipment')}
              {modalType === 'team' && (selectedItem ? 'Edit Team' : 'New Team')}
              {modalType === 'request' && (selectedItem ? 'Request Details' : 'New Maintenance Request')}
            </h2>
            <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-full transition" aria-label="Close modal">
              <X size={24} className="text-white/90" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            {modalType === 'equipment' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-1">Equipment Name</label>
                    <input type="text" className="w-full px-4 py-2 bg-[#101c2b] border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-indigo-500" defaultValue={selectedItem?.name} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-1">Serial Number</label>
                    <input type="text" className="w-full px-4 py-2 bg-[#101c2b] border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-indigo-500" defaultValue={selectedItem?.serialNumber} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-1">Category</label>
                    <select className="w-full px-4 py-2 bg-[#101c2b] border border-white/10 rounded-lg text-white" defaultValue={selectedItem?.category}>
                      <option>Production Equipment</option>
                      <option>Office Equipment</option>
                      <option>IT Equipment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-1">Department</label>
                    <input type="text" className="w-full px-4 py-2 bg-[#101c2b] border border-white/10 rounded-lg text-white" defaultValue={selectedItem?.department} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-1">Assigned Employee</label>
                    <input type="text" className="w-full px-4 py-2 bg-[#101c2b] border border-white/10 rounded-lg text-white" defaultValue={selectedItem?.employee} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-1">Maintenance Team</label>
                    <select className="w-full px-4 py-2 bg-[#101c2b] border border-white/10 rounded-lg text-white" defaultValue={selectedItem?.maintenanceTeam}>
                      <option>Mechanics</option>
                      <option>Electricians</option>
                      <option>IT Support</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-1">Purchase Date</label>
                    <input type="date" className="w-full px-4 py-2 bg-[#101c2b] border border-white/10 rounded-lg text-white" defaultValue={selectedItem?.purchaseDate} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-1">Warranty Expiry</label>
                    <input type="date" className="w-full px-4 py-2 bg-[#101c2b] border border-white/10 rounded-lg text-white" defaultValue={selectedItem?.warrantyExpiry} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-1">Location</label>
                  <input type="text" className="w-full px-4 py-2 bg-[#101c2b] border border-white/10 rounded-lg text-white" defaultValue={selectedItem?.location} />
                </div>
              </div>
            )}
            {modalType === 'team' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-1">Team Name</label>
                  <input type="text" className="w-full px-4 py-2 bg-[#101c2b] border border-white/10 rounded-lg text-white" defaultValue={selectedItem?.name} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-1">Specialization</label>
                  <input type="text" className="w-full px-4 py-2 bg-[#101c2b] border border-white/10 rounded-lg text-white" defaultValue={selectedItem?.specialization} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-1">Team Members</label>
                  <textarea className="w-full px-4 py-2 bg-[#101c2b] border border-white/10 rounded-lg text-white min-h-[96px]" rows="4" placeholder="Enter member names, one per line" defaultValue={selectedItem?.members.join('\n')} />
                </div>
              </div>
            )}
            {modalType === 'request' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-1">Subject</label>
                  <input type="text" className="w-full px-4 py-2 bg-[#101c2b] border border-white/10 rounded-lg text-white" defaultValue={selectedItem?.subject} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-1">Equipment</label>
                    <select className="w-full px-4 py-2 bg-[#101c2b] border border-white/10 rounded-lg text-white" defaultValue={selectedItem?.equipment}>
                      <option>Select Equipment</option>
                      {equipment.map(eq => <option key={eq.id}>{eq.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-1">Request Type</label>
                    <select className="w-full px-4 py-2 bg-[#101c2b] border border-white/10 rounded-lg text-white" defaultValue={selectedItem?.type}>
                      <option>Corrective</option>
                      <option>Preventive</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-1">Maintenance Team</label>
                    <select className="w-full px-4 py-2 bg-[#101c2b] border border-white/10 rounded-lg text-white" defaultValue={selectedItem?.team}>
                      <option>Mechanics</option>
                      <option>Electricians</option>
                      <option>IT Support</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-1">Scheduled Date</label>
                    <input type="date" className="w-full px-4 py-2 bg-[#101c2b] border border-white/10 rounded-lg text-white" defaultValue={selectedItem?.scheduledDate} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-1">Description</label>
                  <textarea className="w-full px-4 py-2 bg-[#101c2b] border border-white/10 rounded-lg text-white min-h-[96px]" rows="4" defaultValue={selectedItem?.description} />
                </div>
                <div className="flex items-center justify-end gap-3 mt-8">
                  <button onClick={closeModal} className="btn-ghost">Cancel</button>
                  <button onClick={() => { /* placeholder save - extend as needed */ handleSave(); }} className="btn-primary shadow-lg">Save</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Simple save handler placeholder (extend to update state as needed)
  const handleSave = () => {
    closeModal();
  };

  // Main app layout
  return (
    <div className="min-h-screen bg-[var(--bg)] text-gray-100 py-10">
      <div className="container-custom px-6">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-extrabold text-lg shadow-lg">GG</div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">GearGuard</h1>
              <p className="text-sm text-[var(--muted)]">Equipment & maintenance request management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="md:hidden btn-ghost" onClick={() => setMobileSidebarOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
            <nav className="hidden md:flex items-center gap-3">
              <button onClick={() => setActiveModule('requests')} className={`btn-ghost ${activeModule === 'requests' ? 'bg-white/6' : ''}`} aria-pressed={activeModule === 'requests'}><Calendar size={16} className="inline mr-2"/>Requests</button>
              <button onClick={() => setActiveModule('equipment')} className={`btn-ghost ${activeModule === 'equipment' ? 'bg-white/6' : ''}`} aria-pressed={activeModule === 'equipment'}><Wrench size={16} className="inline mr-2"/>Equipment</button>
              <button onClick={() => setActiveModule('teams')} className={`btn-ghost ${activeModule === 'teams' ? 'bg-white/6' : ''}`} aria-pressed={activeModule === 'teams'}><Users size={16} className="inline mr-2"/>Teams</button>
              <button onClick={() => setActiveModule('reports')} className={`btn-ghost ${activeModule === 'reports' ? 'bg-white/6' : ''}`} aria-pressed={activeModule === 'reports'}><BarChart3 size={16} className="inline mr-2"/>Reports</button>
              <button className="btn-ghost" aria-label="Settings"><Settings size={16} /></button>
            </nav>
            <button
              className="ml-2 px-3 py-2 rounded-lg border border-white/10 bg-white/10 text-white font-semibold text-xs hover:bg-white/20 transition"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
      </header>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="mobile-sidebar-panel absolute left-0 top-0 h-full w-4/5 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold">Menu</div>
              <button className="btn-ghost" onClick={() => setMobileSidebarOpen(false)} aria-label="Close menu"><ChevronLeft size={20} /></button>
            </div>
            <nav className="space-y-2">
              <button onClick={() => { setActiveModule('requests'); setMobileSidebarOpen(false); }} className={`sidebar-btn ${activeModule === 'requests' ? 'bg-white/4' : ''}`}><Calendar size={16}/> <span>Requests</span></button>
              <button onClick={() => { setActiveModule('equipment'); setMobileSidebarOpen(false); }} className={`sidebar-btn ${activeModule === 'equipment' ? 'bg-white/4' : ''}`}><Wrench size={16}/> <span>Equipment</span></button>
              <button onClick={() => { setActiveModule('teams'); setMobileSidebarOpen(false); }} className={`sidebar-btn ${activeModule === 'teams' ? 'bg-white/4' : ''}`}><Users size={16}/> <span>Teams</span></button>
              <button onClick={() => { setActiveModule('reports'); setMobileSidebarOpen(false); }} className={`sidebar-btn ${activeModule === 'reports' ? 'bg-white/4' : ''}`}><BarChart3 size={16}/> <span>Reports</span></button>
            </nav>
          </aside>
        </div>
      )}

        <div className="mt-6 flex gap-8">
          <aside className="sidebar-modern hidden md:block">
            <nav className="sidebar-modern-nav">
              <button onClick={() => setActiveModule('requests')} className={`sidebar-modern-btn ${activeModule === 'requests' ? 'sidebar-modern-btn-active' : ''}`} aria-pressed={activeModule === 'requests'}><Calendar size={20}/> <span>Requests</span></button>
              <button onClick={() => setActiveModule('equipment')} className={`sidebar-modern-btn ${activeModule === 'equipment' ? 'sidebar-modern-btn-active' : ''}`} aria-pressed={activeModule === 'equipment'}><Wrench size={20}/> <span>Equipment</span></button>
              <button onClick={() => setActiveModule('teams')} className={`sidebar-modern-btn ${activeModule === 'teams' ? 'sidebar-modern-btn-active' : ''}`} aria-pressed={activeModule === 'teams'}><Users size={20}/> <span>Teams</span></button>
              <button onClick={() => setActiveModule('reports')} className={`sidebar-modern-btn ${activeModule === 'reports' ? 'sidebar-modern-btn-active' : ''}`} aria-pressed={activeModule === 'reports'}><BarChart3 size={20}/> <span>Reports</span></button>
            </nav>
            <div className="mt-8 flex flex-col items-center">
              <span className="badge">Industrial • v1</span>
            </div>
          </aside>

          <section className="flex-1">
            <main>
              {activeModule === 'requests' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setActiveView('kanban')} className={`btn-ghost ${activeView === 'kanban' ? 'bg-indigo-600 text-white' : ''}`}>Kanban</button>
                      <button onClick={() => setActiveView('calendar')} className={`btn-ghost ${activeView === 'calendar' ? 'bg-indigo-600 text-white' : ''}`}><Calendar size={16} className="inline mr-2"/>Calendar</button>
                      <button onClick={() => setActiveView('report')} className={`btn-ghost ${activeView === 'report' ? 'bg-indigo-600 text-white' : ''}`}>Reports</button>
                    </div>
                    <div>
                      <button onClick={() => openModal('request')} className="btn-primary"><Plus size={16}/> New Request</button>
                    </div>
                  </div>

                  <div>
                    {activeView === 'kanban' && <KanbanView />}
                    {activeView === 'calendar' && <CalendarView />}
                    {activeView === 'report' && <ReportView />}
                  </div>
                </div>
              )}

              {activeModule === 'equipment' && <EquipmentList />}
              {activeModule === 'teams' && <TeamsList />}
              {activeModule === 'reports' && <ReportView />}
            </main>
          </section>
        </div>
      </div>

      <Modal />
      {/* Floating Action Button for New Request (mobile only) */}
      <button
        className="fixed bottom-6 right-6 z-40 md:hidden flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-400 shadow-2xl text-white text-3xl font-bold hover:scale-105 transition-all fab-float"
        onClick={() => openModal('request')}
        aria-label="New Request"
      >
        <Plus size={32} />
      </button>
    </div>
  );
};

export default GearGuardApp;
