import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.0.2.2:8080/api';

// Lấy token từ AsyncStorage
const getToken = async () => await AsyncStorage.getItem('token');

// Lấy danh sách huy hiệu của user
export const getUserBadges = async (userId) => {
  const token = await getToken();
  const res = await axios.get(`${API_URL}/userBadge/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Lấy tất cả huy hiệu với trạng thái đạt được của user
export const getAllBadgesWithUserStatus = async (userId) => {
  const token = await getToken();
  const res = await axios.get(`${API_URL}/badges/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Chia sẻ huy hiệu lên cộng đồng
export const shareUserBadge = async (badgeId, content, title, tags) => {
  const token = await getToken();
  const res = await axios.post(`${API_URL}/userBadge/share`, {
    badge_id: badgeId,
    content,
    title,
    tags
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Lấy bảng xếp hạng huy hiệu
export const getBadgeLeaderboard = async () => {
  const res = await axios.get(`${API_URL}/badges/leaderboard`);
  return res.data;
}; 