import adminApi from '../api/adminAxios';

const adminAuthService = {
    login: async (data: unknown) => {
        const response = await adminApi.post('/admin/auth/login', data);
        return response.data;
    },

    logout() {
        return adminApi.post('/admin/auth/logout');
    },

    getCurrentAdmin() {
        return adminApi.get('/admin/auth/me');
    }
};

export default adminAuthService;
