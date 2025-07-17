import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { register } from '../services/authService';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      const data = await register(name, email, password);
      // Lưu token, user info vào AsyncStorage hoặc context nếu cần
      Alert.alert('Đăng ký thành công', '', [
        { text: 'OK', onPress: () => navigation.replace('Login') },
      ]);
    } catch (err) {
      Alert.alert('Lỗi', err.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text
        style={{
          fontSize: 32,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 24,
        }}
      >
        Đăng ký
      </Text>
      <TextInput
        placeholder="Tên"
        value={name}
        onChangeText={setName}
        style={{
          borderWidth: 1,
          marginBottom: 12,
          padding: 8,
          borderRadius: 8,
        }}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={{
          borderWidth: 1,
          marginBottom: 12,
          padding: 8,
          borderRadius: 8,
        }}
      />
      <TextInput
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          borderWidth: 1,
          marginBottom: 24,
          padding: 8,
          borderRadius: 8,
        }}
      />
      <Button
        title={loading ? 'Đang đăng ký...' : 'Đăng ký'}
        onPress={handleRegister}
        disabled={loading}
      />
      <TouchableOpacity
        onPress={() => navigation.replace('Login')}
        style={{ marginTop: 16 }}
      >
        <Text style={{ color: '#1a73e8', textAlign: 'center' }}>
          Đã có tài khoản? Đăng nhập
        </Text>
      </TouchableOpacity>
    </View>
  );
}
