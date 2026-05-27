import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import ItineraryScreen from '../screens/ItineraryScreen';
import DiaryScreen from '../screens/DiaryScreen';
import ExpenseScreen from '../screens/ExpenseScreen';

const Tab = createBottomTabNavigator();

const TAB_CONFIG = {
  Home: { label: '首頁', icon: 'home', activeColor: '#667eea' },
  Explore: { label: '探索', icon: 'search', activeColor: '#FF6B6B' },
  Itinerary: { label: '行程', icon: 'calendar', activeColor: '#4ECDC4' },
  Diary: { label: '日記', icon: 'book', activeColor: '#45B7D1' },
  Expense: { label: '記帳', icon: 'wallet', activeColor: '#96CEB4' },
};

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: TAB_CONFIG[route.name]?.activeColor || '#667eea',
        tabBarInactiveTintColor: '#ccc',
        tabBarStyle: {
          height: 80,
          paddingBottom: 20,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          backgroundColor: '#fff',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 10,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const config = TAB_CONFIG[route.name];
          return (
            <Ionicons
              name={focused ? config.icon : `${config.icon}-outline`}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: '首頁' }} />
      <Tab.Screen name="Explore" component={ExploreScreen} options={{ tabBarLabel: '探索' }} />
      <Tab.Screen name="Itinerary" component={ItineraryScreen} options={{ tabBarLabel: '行程' }} />
      <Tab.Screen name="Diary" component={DiaryScreen} options={{ tabBarLabel: '日記' }} />
      <Tab.Screen name="Expense" component={ExpenseScreen} options={{ tabBarLabel: '記帳' }} />
    </Tab.Navigator>
  );
}
