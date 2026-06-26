import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient, { setLogoutCallback, setRefreshCallback } from '../api/axiosClient';
import { useAppDispatch, useAppSelector } from '../../store';
import { authStart, authSuccess, authFailure, logout, setInitialized } from '../../store/slices/authSlice';
import { clearCart } from '../../store/slices/cartSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, error, isInitialized } = useAppSelector((state) => state.auth);

  const performRefresh = async (): Promise<string | null> => {
    try {
      const response = await axiosClient.post('/api/v1/auth/refresh');
      if (response.data.success) {
        const { token, user } = response.data.data;
        dispatch(authSuccess({ token, user }));
        return token;
      }
    } catch (err) {
      dispatch(logout());
      dispatch(clearCart());
    }
    return null;
  };

  const handleLogout = async () => {
    try {
      await axiosClient.post('/api/v1/auth/logout');
    } catch (err) {
      // Ignore errors on logout
    } finally {
      dispatch(logout());
      dispatch(clearCart());
      navigate('/login');
    }
  };

  // Wire callbacks to Axios client on init
  useEffect(() => {
    setLogoutCallback(() => {
      dispatch(logout());
      dispatch(clearCart());
      navigate('/login');
    });

    setRefreshCallback(performRefresh);
  }, [dispatch, navigate]);

  // Attempt initial session restoration on mount
  useEffect(() => {
    if (!isInitialized) {
      const restoreSession = async () => {
        dispatch(authStart());
        const token = await performRefresh();
        if (!token) {
          dispatch(setInitialized());
        }
      };
      restoreSession();
    }
  }, [isInitialized, dispatch]);

  const loginUser = async (data: any) => {
    dispatch(authStart());
    try {
      const response = await axiosClient.post('/api/v1/auth/login', data);
      if (response.data.success) {
        const { token, user } = response.data.data;
        dispatch(authSuccess({ token, user }));
        navigate('/');
      } else {
        dispatch(authFailure(response.data.message || 'Login failed'));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Invalid credentials';
      dispatch(authFailure(errMsg));
      throw new Error(errMsg);
    }
  };

  const registerUser = async (data: any) => {
    dispatch(authStart());
    try {
      const response = await axiosClient.post('/api/v1/auth/register', data);
      if (response.data.success) {
        navigate('/login');
      } else {
        dispatch(authFailure(response.data.message || 'Registration failed'));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Registration failed';
      dispatch(authFailure(errMsg));
      throw new Error(errMsg);
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    isInitialized,
    loginUser,
    registerUser,
    logoutUser: handleLogout,
  };
};
