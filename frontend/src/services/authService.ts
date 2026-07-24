import api from '../api/axios';

const authService = {
    register:async(data:unknown)=>{
        const response = await api.post('/auth/register',data);

        return response.data;
    },

    login:async(data:unknown)=>{
        const response = await api.post('/auth/login',data);

        return response.data;
    },

    logout(){
        return api.get('/auth/logout');
    },

    getCurrentUser(){
        return api.get('/app/me')
    }
};

export default authService;