import { useState } from 'react';
import { useAuthContext } from './useAuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { dispatch } = useAuthContext();
    const navigate = useNavigate();

    const login = async (email, password) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post('/api/auth/login', {
                email,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log(response);

            if (response.status === 200) {
                localStorage.setItem('user', JSON.stringify(response.data));

                dispatch({ type: 'LOGIN', payload: response.data });

                if (!response.data.user.isVerified) {
                    navigate('/verify-email');
                } else {
                    navigate(response.data.user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
                }
            }

            setIsLoading(false);
            return response.data;
        } catch (error) {
            setIsLoading(false);
            
            if (error.response) {
                if (error.response.status === 401) {
                    setError('Invalid email or password');
                } else if (error.response.status === 403) {
                    setError('Please verify your email before logging in');
                } else {
                    setError(error.response.data.message || 'Login failed');
                }
            } else if (error.request) {
                setError('No response from server. Please try again.');
            } else {
                setError('Login failed. Please try again.');
            }
            
            throw error;
        }
    };

    return { login, isLoading, error };
};