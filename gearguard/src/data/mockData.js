export const mockEquipment = [
  { id: 1, name: 'CNC Machine 01', serial: 'SN123', purchaseDate: '2023-01-01', warranty: '2 years', location: 'Production Floor', department: 'Production', teamId: 1, active: true },
  { id: 2, name: 'Laptop A', serial: 'LAP456', purchaseDate: '2024-06-01', warranty: '1 year', location: 'Office Desk', employee: 'John Doe', teamId: 3, active: true },
];

export const mockTeams = [
  { id: 1, name: 'Mechanics', members: ['Tech1', 'Tech2'] },
  { id: 2, name: 'Electricians', members: ['Tech3'] },
  { id: 3, name: 'IT Support', members: ['Tech4', 'Tech5'] },
];

export const mockRequests = [
  { id: 1, type: 'Corrective', subject: 'Leaking Oil', equipmentId: 1, scheduledDate: '2025-12-28', duration: 2, stage: 'New', assignedTo: null },
  { id: 2, type: 'Preventive', subject: 'Routine Checkup', equipmentId: 2, scheduledDate: '2025-12-30', duration: 1, stage: 'New', assignedTo: 'Tech4' },
];