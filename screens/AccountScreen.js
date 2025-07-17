import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AccountScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    };
    fetchUser();
  }, []);
  const upgradeMembership = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('token');

    try {
      const res = await fetch(`http://10.0.2.2:5000/api/user/upgrade/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok && data.updatedUser) {
        await AsyncStorage.setItem('user', JSON.stringify(data.updatedUser));
        setUser(data.updatedUser);
        Alert.alert('Thành công', 'Bạn đã nâng cấp lên Premium!');
      } else {
        Alert.alert('Thất bại' || 'Không thể nâng cấp');
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể kết nối đến server.');
    }

    setLoading(false);
  };
  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
    navigation.replace('MainApp');
  };



  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Bạn chưa đăng nhập</Text>
        <Button title="Đăng nhập" onPress={() => navigation.replace('Login')} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
        {user.name}
      </Text>
      <Text style={{ fontSize: 16, color: '#555', marginBottom: 8 }}>
        {user.email}
      </Text>
      <Text style={{ fontSize: 16, color: '#007AFF', marginBottom: 24 }}>
        Gói hiện tại: {user.membership || 'normal'}
      </Text>

      {user.membership !== 'premium' && (
        <Button
          title={loading ? 'Đang xử lý...' : 'Nâng cấp lên Premium'}
          onPress={upgradeMembership}
          disabled={loading}
          color="#2196F3"
        />
      )}

      <View style={{ marginTop: 24 }}>
        <Button title="Đăng xuất" onPress={handleLogout} color="#e53935" />
      </View>
    </View>
  );
}
