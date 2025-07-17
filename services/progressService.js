import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.0.2.2:8080/api/progress'; // Đổi IP nếu chạy thiết bị thật

// Lấy token từ AsyncStorage
const getToken = async () => await AsyncStorage.getItem('token');

// Lấy thông tin tiến trình tổng quát của user
export const getUserProgressStats = async (userId) => {
  const token = await getToken();
  const res = await axios.get(`${API_URL}/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Lấy tất cả progress của user (để lấy cảm nhận sức khỏe mới nhất)
export const getAllProgress = async () => {
  const token = await getToken();
  const res = await axios.get(`${API_URL}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Ghi nhận tiến trình mới
export const createProgress = async (data) => {
  const token = await getToken();
  const res = await axios.post(`${API_URL}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}; 