import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDB } from './dbContext';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isDBReady } = useDB();

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      setUser({
        name: 'Admin User',
        rol: 'admin',
        username: 'admin'
      });
    }
    setIsLoading(false);
  }, []);

  const login = () => {
    setIsAuthenticated(true);
    setUser({
      name: 'Admin User',
      rol: 'admin',
      username: 'admin'
    });
    localStorage.setItem('isAuthenticated', 'true');
  };

  const logout = async () => {
    // Clear all database stores
    if (isDBReady) {
      const { db } = await import('../db/indexedDB');
      try {
        await db.clear('users');
        await db.clear('tables');
        await db.clear('persons');
        await db.clear('factions');
        await db.clear('factionConfigs');
        await db.clear('logs');
        await db.clear('exportInfo');
        await db.clear('multiFileImport');
        console.log('Database cleared on logout');
      } catch (error) {
        console.error('Error clearing database on logout:', error);
      }
    }
    
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('importMode');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};