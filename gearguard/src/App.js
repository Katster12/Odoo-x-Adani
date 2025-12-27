import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from './Context/AuthContext';
import Login from './Components/Login';
import Sidebar from './Components/Sidebar';
import Header from './Components/Header';
import Footer from './Components/Footer';
import EquipmentList from './Components/Equipment/List';
import EquipmentForm from './Components/Equipment/Form';
import TeamList from './Components/Team/List';
import TeamForm from './Components/Team/Form';
import RequestForm from './Components/Request/Form';
import KanbanBoard from './Components/Kanban/Board';
import CalendarView from './Components/Calendar/View';
import ReportChart from './Components/Report/Chart';
import { equipmentAPI, teamAPI, requestAPI } from './services/api';

function App() {
  const { user, loading: authLoading } = useContext(AuthContext);
  
  const [view, setView] = useState('kanban');
  const [equipment, setEquipment] = useState([]);
  const [teams, setTeams] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showForm, setShowForm] = useState({ equipment: false, team: false, request: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [equipmentData, teamsData, requestsData] = await Promise.all([
        equipmentAPI.getAll(),
        teamAPI.getAll(),
        requestAPI.getAll()
      ]);
      setEquipment(equipmentData);
      setTeams(teamsData);
      setRequests(requestsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const addEquipment = async (newEq) => {
    try {
      const equipmentData = {
        name: newEq.name,
        srno: newEq.serial,
        category: newEq.category || null,
        purchasedate: newEq.purchaseDate || null,
        warrentyenddate: newEq.warranty || null,
        location: newEq.location,
        deptid: newEq.deptid || null,
        maintenanceid: newEq.teamId || null,
        technicianuserid: newEq.technicianuserid || null
      };
      const created = await equipmentAPI.create(equipmentData);
      await fetchAllData();
    } catch (err) {
      alert(`Error creating equipment: ${err.message}`);
    }
  };

  const updateEquipment = async (id, updates) => {
    try {
      const equipmentData = {
        name: updates.name,
        srno: updates.serial,
        category: updates.category || null,
        purchasedate: updates.purchaseDate || null,
        warrentyenddate: updates.warranty || null,
        location: updates.location,
        deptid: updates.deptid || null,
        maintenanceid: updates.teamId || null,
        technicianuserid: updates.technicianuserid || null
      };
      await equipmentAPI.update(id, equipmentData);
      await fetchAllData();
    } catch (err) {
      alert(`Error updating equipment: ${err.message}`);
    }
  };

  const scrapEquipment = async (id) => {
    try {
      await equipmentAPI.delete(id);
      await fetchAllData();
    } catch (err) {
      alert(`Error deleting equipment: ${err.message}`);
    }
  };

  const addTeam = async (newTeam) => {
    try {
      const teamData = {
        name: newTeam.name,
        desc: newTeam.desc || ''
      };
      await teamAPI.create(teamData);
      await fetchAllData();
    } catch (err) {
      alert(`Error creating team: ${err.message}`);
    }
  };

  const updateTeam = async (id, updates) => {
    try {
      const teamData = {
        name: updates.name,
        desc: updates.desc || ''
      };
      await teamAPI.update(id, teamData);
      await fetchAllData();
    } catch (err) {
      alert(`Error updating team: ${err.message}`);
    }
  };

  const addRequest = async (newReq) => {
    try {
      const requestData = {
        type: newReq.type === 'Corrective' ? 'CORRECTIVE' : 'PREVENTIVE',
        priority: (newReq.priority || 'MED').toUpperCase(),
        subject: newReq.subject,
        description: newReq.description || '',
        equipmentid: newReq.equipmentId,
        scheduleddate: newReq.scheduledDate ? new Date(newReq.scheduledDate).toISOString() : null,
        duedate: newReq.duedate ? new Date(newReq.duedate).toISOString() : null
      };
      await requestAPI.create(requestData);
      await fetchAllData();
    } catch (err) {
      alert(`Error creating request: ${err.message}`);
    }
  };

  const updateRequest = async (id, updates) => {
    try {
      if (updates.stage) {
        const stageMap = {
          'New': 'NEW',
          'In Progress': 'IN_PROGRESS',
          'Repaired': 'REPAIRED',
          'Scrap': 'SCRAP'
        };
        await requestAPI.updateStage(id, stageMap[updates.stage] || updates.stage);
      } else {
        const requestData = {
          type: updates.type === 'Corrective' ? 'CORRECTIVE' : 'PREVENTIVE',
          stage: updates.stage || 'NEW',
          priority: (updates.priority || 'MED').toUpperCase(),
          subject: updates.subject,
          description: updates.notes || updates.description || '',
          maintenanceid: updates.maintenanceid || null,
          assigneduserid: updates.assigneduserid || null,
          scheduleddate: updates.scheduledDate ? new Date(updates.scheduledDate).toISOString() : null,
          duedate: updates.duedate ? new Date(updates.duedate).toISOString() : null,
          hoursspent: updates.duration || null
        };
        await requestAPI.update(id, requestData);
      }
      await fetchAllData();
    } catch (err) {
      alert(`Error updating request: ${err.message}`);
    }
  };

  const renderView = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#ff6b6b' }}>
          <p>Error loading data: {error}</p>
          <button onClick={fetchAllData} style={{ marginTop: '1rem' }}>Retry</button>
        </div>
      );
    }

    switch (view) {
      case 'equipment':
        return (
          <>
            <EquipmentList equipment={equipment} onEdit={setSelectedEquipment} onShowForm={(show) => setShowForm({ ...showForm, equipment: show })} />
            {showForm.equipment && (
              <EquipmentForm
                equipment={selectedEquipment}
                onSave={addEquipment}
                onUpdate={updateEquipment}
                onClose={() => { setShowForm({ ...showForm, equipment: false }); setSelectedEquipment(null); }}
                requests={requests}
                onScrap={scrapEquipment}
              />
            )}
          </>
        );
      case 'teams':
        return (
          <>
            <TeamList teams={teams} onEdit={setSelectedTeam} onShowForm={(show) => setShowForm({ ...showForm, team: show })} />
            {showForm.team && (
              <TeamForm
                team={selectedTeam}
                onSave={addTeam}
                onUpdate={updateTeam}
                onClose={() => { setShowForm({ ...showForm, team: false }); setSelectedTeam(null); }}
              />
            )}
          </>
        );
      case 'requests':
        return (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <button onClick={() => setShowForm({ ...showForm, request: true })}>+ New Request</button>
            </div>
            {showForm.request && (
              <RequestForm
                equipment={equipment}
                teams={teams}
                onSave={addRequest}
                onClose={() => setShowForm({ ...showForm, request: false })}
              />
            )}
          </>
        );
      case 'kanban':
        return <KanbanBoard requests={requests} onUpdate={updateRequest} equipment={equipment} />;
      case 'calendar':
        return (
          <>
            <CalendarView 
              requests={requests.filter(r => r.type === 'PREVENTIVE' || r.type === 'Preventive')} 
              equipment={equipment}
              teams={teams}
              showForm={showForm.request}
              onAdd={() => setShowForm({ ...showForm, request: true })}
              onSave={addRequest}
              onClose={() => setShowForm({ ...showForm, request: false })}
            />
            {showForm.request && (
              <RequestForm
                equipment={equipment}
                teams={teams}
                onSave={addRequest}
                onClose={() => setShowForm({ ...showForm, request: false })}
              />
            )}
          </>
        );
      case 'reports':
        return <ReportChart requests={requests} teams={teams} equipment={equipment} />;
      default:
        return <KanbanBoard requests={requests} onUpdate={updateRequest} equipment={equipment} />;
    }
  };

  return (
    <div className="App">
      <Header />
      <div className="flex">
        <Sidebar onViewChange={setView} />
        <main className="flex-1 p-4">
          {renderView()}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default App;