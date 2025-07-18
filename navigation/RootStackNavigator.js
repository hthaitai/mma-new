// /navigation/RootStackNavigator.js
import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import AccountScreen from '../screens/AccountScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
// Import các screen mới
import DashboardScreen from '../screens/DashboardScreen';
import SmokingInfoScreen from '../screens/SmokingInfoScreen';
// import CreatePlanScreen from '../screens/CreatePlanScreen'; // Removed - using QuitPlanForm in PlanScreen instead

const Stack = createNativeStackNavigator();

export default function RootStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainApp" component={BottomTabNavigator} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Account" component={AccountScreen} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
      
      {/* Các screen mới cho flow tạo kế hoạch cai thuốc */}
      <Stack.Screen
        name="SmokingInfo"
        component={SmokingInfoScreen}
        options={{
          headerShown: true,
          title: 'Thông tin hút thuốc',
          headerStyle: { backgroundColor: '#f8f9fa' },
          headerTintColor: '#007bff',
          headerTitleStyle: { fontWeight: 'bold' }
        }}
      />
      {/* CreatePlan screen removed - using QuitPlanForm modal in PlanScreen instead */}
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          headerShown: true,
          title: 'Dashboard',
          headerStyle: { backgroundColor: '#f8f9fa' },
          headerTintColor: '#28a745',
          headerTitleStyle: { fontWeight: 'bold' }
        }}
      />
    </Stack.Navigator>
  );
}
