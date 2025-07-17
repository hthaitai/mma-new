// /navigation/BottomTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import PlanScreen from '../screens/PlanScreen';
import ProgressScreen from '../screens/ProgressScreen';
import CommunityScreen from '../screens/CommunityScreen';
import AccountScreen from '../screens/AccountScreen';
import CoachChatScreen from '../screens/coach/CoachChatScreen';
import NotificationsScreen from '../screens/coach/NotificationsScreen';
import DashboardScreen from '../screens/coach/DashboardScreen';
import CoachProfileScreen from '../screens/coach/CoachProfileScreen';

const Tab = createBottomTabNavigator();

export function BottomTabNavigatorUser() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Trang chủ':
              iconName = 'home';
              break;
            case 'Kế hoạch':
              iconName = 'list';
              break;
            case 'Tiến trình':
              iconName = 'bar-chart';
              break;
            case 'Cộng đồng':
              iconName = 'chatbubbles';
              break;
            case 'Tài khoản':
              iconName = 'person';
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Trang chủ" component={HomeScreen} />
      <Tab.Screen name="Kế hoạch" component={PlanScreen} />
      <Tab.Screen name="Tiến trình" component={ProgressScreen} />
      <Tab.Screen name="Cộng đồng" component={CommunityScreen} />
      <Tab.Screen name="Tài khoản" component={AccountScreen} />
    </Tab.Navigator>
  );
}

export function BottomTabNavigatorCoach() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Dashboard':
              iconName = 'analytics';
              break;
            case 'Coach Chat':
              iconName = 'chatbox-ellipses';
              break;
            case 'Coach Notifications':
              iconName = 'notifications';
              break;
            case 'Hồ sơ':
              iconName = 'person-circle';
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Coach Chat" component={CoachChatScreen} options={{ tabBarLabel: 'Chat' }} />
      <Tab.Screen name="Coach Notifications" component={NotificationsScreen} options={{ tabBarLabel: 'Nhắc nhở' }} />
      <Tab.Screen
        name="Hồ sơ"
        component={CoachProfileScreen}
        options={{
          tabBarLabel: 'Hồ sơ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" size={size} color={color} />
          ),
        }}
      />
      {/* Bỏ tab Tài khoản cho coach */}
    </Tab.Navigator>
  );
}

// Mặc định export cho user
export default BottomTabNavigatorUser;
