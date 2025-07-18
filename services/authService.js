// services/authService.js
import axios from 'axios';
const API_URL = 'http://10.0.2.2:8080/api/auth'; // Android Emulator
// Hoặc dùng IP LAN nếu là thiết bị thật

import AsyncStorage from '@react-native-async-storage/async-storage';

export const loginUser = async (email, password) => {
  try {
    const res = await axios.post(`${API_URL}/login`, { email, password });
    // Lưu token và user vào AsyncStorage
    await AsyncStorage.setItem('token', res.data.user.token);
    await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || 'Đăng nhập thất bại';
  }
};

export const register = async (name, email, password) => {
  try {
    const res = await axios.post(`${API_URL}/register`, { name, email, password });
    return res.data; // { message, user: { ... } }
  } catch (err) {
    throw err.response?.data?.message || 'Đăng ký thất bại';
  }
};
