const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'Request failed');
  }
  return response.json();
};

export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
  },

  signup: async (email, password, name) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    return handleResponse(response);
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
    });
    return handleResponse(response);
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_URL}/users/me`, {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  }
};

export const equipmentAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_URL}/equipment?${params}`, {
      headers: getAuthHeader()
    });
    const data = await handleResponse(response);
    return data.equipment || [];
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/equipment/${id}`, {
      headers: getAuthHeader()
    });
    const data = await handleResponse(response);
    return data.equipment;
  },

  create: async (equipmentData) => {
    const response = await fetch(`${API_URL}/equipment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(equipmentData)
    });
    const data = await handleResponse(response);
    return data.equipment;
  },

  update: async (id, equipmentData) => {
    const response = await fetch(`${API_URL}/equipment/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(equipmentData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/equipment/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse(response);
  }
};

export const teamAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/maintenance-teams`, {
      headers: getAuthHeader()
    });
    const data = await handleResponse(response);
    return data.teams || [];
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/maintenance-teams/${id}`, {
      headers: getAuthHeader()
    });
    const data = await handleResponse(response);
    return data.team;
  },

  create: async (teamData) => {
    const response = await fetch(`${API_URL}/maintenance-teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(teamData)
    });
    const data = await handleResponse(response);
    return data.team;
  },

  update: async (id, teamData) => {
    const response = await fetch(`${API_URL}/maintenance-teams/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(teamData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/maintenance-teams/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  addMember: async (teamId, userid, islead = 0) => {
    const response = await fetch(`${API_URL}/maintenance-teams/${teamId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ userid, islead })
    });
    return handleResponse(response);
  },

  removeMember: async (teamId, memberId) => {
    const response = await fetch(`${API_URL}/maintenance-teams/${teamId}/members/${memberId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse(response);
  }
};

export const requestAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_URL}/maintenance-requests?${params}`, {
      headers: getAuthHeader()
    });
    const data = await handleResponse(response);
    return data.requests || [];
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/maintenance-requests/${id}`, {
      headers: getAuthHeader()
    });
    const data = await handleResponse(response);
    return data.request;
  },

  create: async (requestData) => {
    const response = await fetch(`${API_URL}/maintenance-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(requestData)
    });
    const data = await handleResponse(response);
    return data.request;
  },

  update: async (id, requestData) => {
    const response = await fetch(`${API_URL}/maintenance-requests/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(requestData)
    });
    return handleResponse(response);
  },

  updateStage: async (id, stage) => {
    const response = await fetch(`${API_URL}/maintenance-requests/${id}/stage`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ stage })
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/maintenance-requests/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  getMyRequests: async () => {
    const response = await fetch(`${API_URL}/maintenance-requests/my-requests`, {
      headers: getAuthHeader()
    });
    const data = await handleResponse(response);
    return data.requests || [];
  },

  getAssignedRequests: async () => {
    const response = await fetch(`${API_URL}/maintenance-requests/assigned-to-me`, {
      headers: getAuthHeader()
    });
    const data = await handleResponse(response);
    return data.requests || [];
  }
};

export const departmentAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/departments`, {
      headers: getAuthHeader()
    });
    const data = await handleResponse(response);
    return data.departments || [];
  },

  create: async (deptname) => {
    const response = await fetch(`${API_URL}/departments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ deptname })
    });
    const data = await handleResponse(response);
    return data.department;
  }
};