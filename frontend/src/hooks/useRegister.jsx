import { useState } from 'react';
import { useAuthContext } from './useAuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const useRegister = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { dispatch } = useAuthContext();
    const navigate = useNavigate();

    const register = async (first_name, last_name, username, email, password) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post('/api/auth/register', {
                first_name,
                last_name,
                username,
                email,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log(response);

            if (response.status === 201) {
                localStorage.setItem('user', JSON.stringify(response.data.data));

                dispatch({ type: 'LOGIN', payload: response.data.data });

                navigate(response.data.data.user.isVerified ? '/dashboard' : '/verify-email');
            }

            setIsLoading(false);
            return response.data;
        } catch (error) {
            setIsLoading(false);

            if (error.response) {
                setError(error.response.data.data.message || 'Registration failed');

                if (error.response.data.data.errors) {
                    setError(error.response.data.data.errors);
                }
            } else if (error.request) {
                setError('No response from server. Please try again.');
            } else {
                setError('Registration failed. Please try again.');
            }

            throw error;
        }
    };

    return { register, isLoading, error };
};