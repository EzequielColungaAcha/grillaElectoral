import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../db/indexedDB';

const DBContext = createContext();

export const useDB = () => {
  const context = useContext(DBContext);
  if (!context) {
    throw new Error('useDB must be used within a DBProvider');
  }
  return context;
};

export const DBProvider = ({ children }) => {
  const [isDBReady, setIsDBReady] = useState(false);
  const [subscribers, setSubscribers] = useState({});

  useEffect(() => {
    const initDB = async () => {
      try {
        await db.init();
        setIsDBReady(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    initDB();
  }, []);

  const subscribe = (event, callback) => {
    if (!subscribers[event]) {
      subscribers[event] = [];
    }
    subscribers[event].push(callback);

    return () => {
      subscribers[event] = subscribers[event].filter((cb) => cb !== callback);
    };
  };

  const emit = (event, data) => {
    if (subscribers[event]) {
      subscribers[event].forEach((callback) => callback(data));
    }
  };

  // CRUD operations with event emission
  const addRecord = async (storeName, data) => {
    const result = await db.add(storeName, data);
    emit(`${storeName}_added`, result);
    return result;
  };

  const updateRecord = async (storeName, data) => {
    const result = await db.update(storeName, data);
    emit(`${storeName}_updated`, result);
    return result;
  };

  const deleteRecord = async (storeName, id) => {
    const result = await db.delete(storeName, id);
    emit(`${storeName}_deleted`, { _id: id });
    return result;
  };

  const getRecord = async (storeName, id) => {
    return await db.get(storeName, id);
  };

  const getAllRecords = async (storeName) => {
    return await db.getAll(storeName);
  };

  const getRecordsByIndex = async (storeName, indexName, value) => {
    return await db.getByIndex(storeName, indexName, value);
  };

  const countRecords = async (storeName) => {
    return await db.count(storeName);
  };

  const importData = async (data) => {
    const result = await db.importData(data);
    emit('data_imported', result);
    return result;
  };

  const value = {
    isDBReady,
    subscribe,
    emit,
    addRecord,
    updateRecord,
    deleteRecord,
    getRecord,
    getAllRecords,
    getRecordsByIndex,
    countRecords,
    importData,
  };

  return <DBContext.Provider value={value}>{children}</DBContext.Provider>;
};
