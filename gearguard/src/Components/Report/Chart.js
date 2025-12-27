import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ReportChart = ({ requests, teams, equipment }) => {
  // Simple aggregation: requests per team
  const data = teams.map(team => ({
    name: team.name,
    requests: requests.filter(r => /* assume team from equipment */ r.equipmentId).length, // Mock
  }));

  return (
    <div>
      <h2>Reports: Requests per Team</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="requests" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReportChart;