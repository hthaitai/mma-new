// /navigation/RootStackNavigator.js
import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigatorUser, BottomTabNavigatorCoach } from './BottomTabNavigator';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import AccountScreen from '../screens/AccountScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

const Stack = createNativeStackNavigator();

function AuthLoadingScreen({ navigation }) {
  useEffect(() => {
    (async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          if (user.role === 'coach') {
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainApp', params: { isCoach: true } }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainApp', params: { isCoach: false } }],
            });
          }
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      } catch {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    })();
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#333" />
    </View>
  );
}

export default function RootStackNavigator() {
  // Bỏ useEffect kiểm tra role ở đây, chuyển sang AuthLoadingScreen
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
      <Stack.Screen name="MainApp" component={({ route }) => {
        const isCoach = route?.params?.isCoach;
        return isCoach ? BottomTabNavigatorCoach() : BottomTabNavigatorUser();
      }} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Account" component={AccountScreen} />
    </Stack.Navigator>
  );
}
