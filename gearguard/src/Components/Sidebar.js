import React, { useContext } from 'react';
import { AuthContext } from '../Context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ onViewChange }) => {
  const { user } = useContext(AuthContext);
  
  return (
    <aside>
      <h2>Navigation</h2>
      <nav>
        {/* All users can see kanban */}
        <button onClick={() => onViewChange('kanban')}>📊 Kanban Board</button>
        
        {/* Only users can create requests */}
        {user?.role === 'user' && (
          <>
            <button onClick={() => onViewChange('equipment')}>⚙️ Equipment</button>
            <button onClick={() => onViewChange('teams')}>👥 Teams</button>
            <button onClick={() => onViewChange('requests')}>📋 Requests</button>
            <button onClick={() => onViewChange('calendar')}>📅 Calendar</button>
          </>
        )}
        
        {/* Only technicians can see all management features */}
        {user?.role === 'technician' && (
          <>
            <button onClick={() => onViewChange('equipment')}>⚙️ Equipment</button>
            <button onClick={() => onViewChange('teams')}>👥 Teams</button>
            <button onClick={() => onViewChange('calendar')}>📅 Calendar</button>
          </>
        )}
        
        {/* Everyone can see reports */}
        <button onClick={() => onViewChange('reports')}>📈 Reports</button>
      </nav>
    </aside>
  );
};

export default Sidebar;