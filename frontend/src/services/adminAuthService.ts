import api from '../api/axios';

const adminAuthService = {
    login: async (data: unknown) => {
        const response = await api.post('/admin/auth/login', data);
        return response.data;
    },

    logout() {
        return api.post('/admin/auth/logout');
    },

    getCurrentAdmin() {
        return api.get('/admin/auth/me');
    },
        
    adminGetCurrentUser() {
        return api.get('/admin/me');
    },
    
    adminRefresh() {
        return api.post('/admin/auth/refresh');
    }
};

export default adminAuthService;
