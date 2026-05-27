import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [trips, setTrips] = useState([]);
  const [diaries, setDiaries] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedTrips = await AsyncStorage.getItem('trips');
      const savedDiaries = await AsyncStorage.getItem('diaries');
      const savedExpenses = await AsyncStorage.getItem('expenses');
      if (savedTrips) setTrips(JSON.parse(savedTrips));
      if (savedDiaries) setDiaries(JSON.parse(savedDiaries));
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    } catch (e) {
      console.error('Load data error:', e);
    }
  };

  const saveTrips = async (data) => {
    setTrips(data);
    await AsyncStorage.setItem('trips', JSON.stringify(data));
  };

  const saveDiaries = async (data) => {
    setDiaries(data);
    await AsyncStorage.setItem('diaries', JSON.stringify(data));
  };

  const saveExpenses = async (data) => {
    setExpenses(data);
    await AsyncStorage.setItem('expenses', JSON.stringify(data));
  };

  const addTrip = (trip) => {
    const newTrip = { ...trip, id: Date.now().toString(), createdAt: new Date().toISOString() };
    saveTrips([...trips, newTrip]);
    return newTrip;
  };

  const updateTrip = (id, updates) => {
    const updated = trips.map((t) => (t.id === id ? { ...t, ...updates } : t));
    saveTrips(updated);
  };

  const deleteTrip = (id) => {
    saveTrips(trips.filter((t) => t.id !== id));
  };

  const addDiary = (diary) => {
    const newDiary = { ...diary, id: Date.now().toString(), createdAt: new Date().toISOString() };
    saveDiaries([...diaries, newDiary]);
  };

  const deleteDiary = (id) => {
    saveDiaries(diaries.filter((d) => d.id !== id));
  };

  const addExpense = (expense) => {
    const newExpense = { ...expense, id: Date.now().toString(), createdAt: new Date().toISOString() };
    saveExpenses([...expenses, newExpense]);
  };

  const deleteExpense = (id) => {
    saveExpenses(expenses.filter((e) => e.id !== id));
  };

  return (
    <AppContext.Provider value={{
      trips, diaries, expenses,
      addTrip, updateTrip, deleteTrip,
      addDiary, deleteDiary,
      addExpense, deleteExpense,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
