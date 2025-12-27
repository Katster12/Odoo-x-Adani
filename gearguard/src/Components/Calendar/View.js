import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../Calendar.css';

const locales = { 'en-US': require('date-fns/locale/en-US') };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const CalendarView = ({ requests, onAdd, showForm, equipment, teams, onSave, onClose }) => {
  const events = requests.map(req => {
    const equipmentItem = equipment.find(e => e.id === req.equipmentid);
    const scheduledDate = req.scheduleddate ? new Date(req.scheduleddate) : new Date();
    const duration = req.hoursspent || req.duration || 1;
    
    return {
      title: `${req.subject || 'Maintenance'} - ${equipmentItem?.name || 'Equipment'}`,
      start: scheduledDate,
      end: new Date(scheduledDate.getTime() + duration * 60 * 60 * 1000),
      allDay: false,
      resourceId: req.reqid,
    };
  });

  return (
    <div>
      <h2>📅 Preventive Maintenance Calendar</h2>
      <button onClick={onAdd} className="btn-schedule">+ Schedule New Maintenance</button>
      
      {showForm && (
        <div className="calendar-form-wrapper">
          <h3>New Maintenance Request</h3>
          <p style={{ color: '#666', marginBottom: '1rem' }}>Create a new preventive maintenance schedule</p>
          <div style={{ minHeight: '300px', background: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
            <p>📋 Open the full request form from the "Requests" section to add detailed information.</p>
            <button onClick={onClose} className="btn-close-form">Go to Requests Section</button>
          </div>
        </div>
      )}
      
      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          onSelectEvent={(event) => alert(`📌 ${event.title}\n\nClick "Schedule New" to edit or create similar maintenance schedules.`)}
          onSelectSlot={(slot) => {
            alert(`Selected: ${format(slot.start, 'MMM dd, yyyy')}\n\nClick "Schedule New" to create maintenance for this date.`);
            onAdd();
          }}
          selectable
          popup
        />
      </div>
    </div>
  );
};

export default CalendarView;