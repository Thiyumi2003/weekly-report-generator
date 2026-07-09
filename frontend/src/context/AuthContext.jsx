import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync session on component mounting
  useEffect(() => {
    const loadStoredAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify with server to ensure token is still active and valid
          const response = await api.get('/auth/me');
          if (response.data.success) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        } catch (error) {
          console.error('Session validation failed, resetting...', error);
          logoutLocally();
        }
      }
      setLoading(false);
    };

    loadStoredAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: userToken, user: userData } = response.data;
      
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(userToken);
      setUser(userData);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      const msg = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message: msg };
    }
  };

  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const { token: userToken, user: userData } = response.data;

      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(userToken);
      setUser(userData);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message: msg };
    }
  };

  const logoutLocally = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Server side logout failed, cleaning up local storage anyway.', error);
    } finally {
      logoutLocally();
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
