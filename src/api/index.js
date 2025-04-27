/**
 * API module index
 * Exports all API services for easy import
 */

import * as authRaw from './auth';
import { debugApiCall } from './debug';

// Wrap all auth API methods with debug logging
const authApi = {
  register: debugApiCall(authRaw.register, 'register'),
  login: debugApiCall(authRaw.login, 'login'),
  logout: debugApiCall(authRaw.logout, 'logout'),
  isAuthenticated: debugApiCall(authRaw.isAuthenticated, 'isAuthenticated'),
  getCurrentUser: debugApiCall(authRaw.getCurrentUser, 'getCurrentUser'),
  getToken: debugApiCall(authRaw.getToken, 'getToken'),
  getProfile: debugApiCall(authRaw.getProfile, 'getProfile'),
  
  // Helper function to check API connection
  checkConnection: async () => {
    try {
      console.log('Checking API connection...');
      const response = await fetch('http://localhost:3000/api/v1/health', { 
        method: 'GET',
        timeout: 3000 
      });
      const isConnected = response.ok;
      console.log('API connection status:', isConnected ? 'Connected' : 'Failed');
      return isConnected;
    } catch (error) {
      console.error('API connection error:', error);
      return false;
    }
  }
};

console.log('API services initialized with debug wrappers');

// Export all API services
export { authApi }; 