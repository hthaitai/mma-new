import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import { loginUser } from '../services/authService';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert('Vui lòng nhập đầy đủ thông tin');
    return;
  }
  setLoading(true);
  try {
    const data = await loginUser(email, password);

if (data.user?.token) {
  await AsyncStorage.setItem('token', data.user.token);
  await AsyncStorage.setItem('user', JSON.stringify(data.user));
  navigation.replace('MainApp');
} else {
  Alert.alert('Đăng nhập thất bại', 'Không nhận được token');
}
  } catch (err) {
    Alert.alert('Lỗi', err.toString());
  } finally {
    setLoading(false);
  }
};

  // Nút back ở góc trên bên trái
  const BackButton = () => (
    <TouchableOpacity
      style={{ position: 'absolute', top: 40, left: 16, zIndex: 10 }}
      onPress={() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.replace('MainApp', { screen: 'Account' });
        }
      }}
    >
      <Ionicons name="arrow-back" size={28} color="#333" />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <BackButton />
      <Text style={{ fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 }}>Đăng nhập</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{ borderWidth: 1, marginBottom: 12, padding: 8, borderRadius: 8 }} />
      <TextInput placeholder="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, marginBottom: 24, padding: 8, borderRadius: 8 }} />
      <Button title={loading ? 'Đang đăng nhập...' : 'Đăng nhập'} onPress={handleLogin} disabled={loading} />
      <Text style={{ marginTop: 16, textAlign: 'center' }} onPress={() => navigation.replace('Register')}>Chưa có tài khoản? Đăng ký</Text>
    </View>
  );
}
