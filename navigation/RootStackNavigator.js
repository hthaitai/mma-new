// /navigation/RootStackNavigator.js
import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigatorUser, BottomTabNavigatorCoach } from './BottomTabNavigator';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import AccountScreen from '../screens/AccountScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

export default function RootStackNavigator() {
  const [isCoach, setIsCoach] = React.useState(null);
  React.useEffect(() => {
    (async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          console.log('USER FROM ASYNCSTORAGE:', user); // DEBUG log
          setIsCoach(user.role === 'coach');
        } else {
          setIsCoach(false);
        }
      } catch {
        setIsCoach(false);
      }
    })();
  }, []);

  if (isCoach === null) return null; // hoặc loading indicator

  console.log('isCoach:', isCoach);

  return (
    <Stack.Navigator
      key={isCoach ? 'coach' : 'user'} // Force remount when role changes
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="MainApp" component={isCoach ? BottomTabNavigatorCoach : BottomTabNavigatorUser} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Account" component={AccountScreen} />
    </Stack.Navigator>
  );
}
