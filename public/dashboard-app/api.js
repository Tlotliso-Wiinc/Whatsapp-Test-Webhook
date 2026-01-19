// API service
const API_BASE = '/api/dashboard';

window.api = {
    getStats: () => fetch(`${API_BASE}/stats`).then(r => r.json()),
    getUsers: (page = 1, limit = 10) => 
        fetch(`${API_BASE}/users?page=${page}&limit=${limit}`).then(r => r.json()),
    getChats: (page = 1, limit = 10) => 
        fetch(`${API_BASE}/chats?page=${page}&limit=${limit}`).then(r => r.json()),
    getChatDetails: (id) => 
        fetch(`${API_BASE}/chats/${id}`).then(r => r.json()),
    getMessages: (page = 1, limit = 10) => 
        fetch(`${API_BASE}/messages?page=${page}&limit=${limit}`).then(r => r.json()),
    getKnowledge: (page = 1, limit = 10, type = '') => 
        fetch(`${API_BASE}/knowledge?page=${page}&limit=${limit}${type ? `&type=${type}` : ''}`).then(r => r.json()),
    createKnowledge: (data) => 
        fetch(`${API_BASE}/knowledge`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(r => r.json()),
    updateKnowledge: (id, data) => 
        fetch(`${API_BASE}/knowledge/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(r => r.json()),
    deleteKnowledge: (id) => 
        fetch(`${API_BASE}/knowledge/${id}`, { method: 'DELETE' }).then(r => r.json())
};
