import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.0.2.2:8080/api';
const PROGRESS_URL = `${BASE_URL}/progress`;
const STAGES_URL = `${BASE_URL}/stages`;

// Lấy token từ AsyncStorage
const getToken = async () => await AsyncStorage.getItem('token');

// ==========================================
// PROGRESS APIs
// ==========================================

// Lấy thông tin tiến trình tổng quát của user
export const getUserProgressStats = async (userId) => {
  try {
    const token = await getToken();
    console.log('🚀 [API] Getting user progress stats for:', userId);
    
    const res = await axios.get(`${PROGRESS_URL}/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ [API] Get user progress stats success:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ [API] Error fetching user progress stats:');
    console.error('URL:', `${PROGRESS_URL}/user/${userId}`);
    console.error('UserId:', userId);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Lấy tất cả progress của user (để lấy cảm nhận sức khỏe mới nhất)
export const getAllProgress = async () => {
  try {
    const token = await getToken();
    console.log('🚀 [API] Getting all progress');
    
    const res = await axios.get(`${PROGRESS_URL}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ [API] Get all progress success:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ [API] Error fetching all progress:');
    console.error('URL:', `${PROGRESS_URL}`);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Ghi nhận tiến trình mới
export const createProgress = async (data) => {
  try {
    const token = await getToken();
    console.log('🚀 [API] Creating progress with data:', data);
    
    const res = await axios.post(`${PROGRESS_URL}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ [API] Create progress success:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ [API] Error creating progress:');
    console.error('URL:', `${PROGRESS_URL}`);
    console.error('Data sent:', data);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Cập nhật tiến trình
export const updateProgress = async (progressId, data) => {
  try {
    const token = await getToken();
    const res = await axios.put(`${PROGRESS_URL}/${progressId}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error('Error updating progress:', error);
    throw error;
  }
};

// Xóa tiến trình
export const deleteProgress = async (progressId) => {
  try {
    const token = await getToken();
    const res = await axios.delete(`${PROGRESS_URL}/${progressId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error('Error deleting progress:', error);
    throw error;
  }
};

// ==========================================
// STAGES APIs
// ==========================================

// Lấy tất cả stages
export const getAllStages = async () => {
  try {
    const token = await getToken();
    const res = await axios.get(`${STAGES_URL}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching stages:', error);
    throw error;
  }
};

// Lấy chi tiết một stage
export const getStageById = async (stageId) => {
  try {
    const token = await getToken();
    const res = await axios.get(`${STAGES_URL}/${stageId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching stage:', error);
    throw error;
  }
};

// Lấy stages theo quit plan
export const getStagesByPlan = async (planId) => {
  try {
    const token = await getToken();
    const res = await axios.get(`${STAGES_URL}/plan/${planId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching stages by plan:', error);
    throw error;
  }
};

// Cập nhật tiến trình của stage
export const updateStageProgress = async (stageId, progressData) => {
  try {
    const token = await getToken();
    const res = await axios.put(`${STAGES_URL}/${stageId}/progress`, progressData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error('Error updating stage progress:', error);
    throw error;
  }
};

// ==========================================
// HEALTH TRACKING APIs
// ==========================================

// Lấy cải thiện sức khỏe theo thời gian
export const getHealthImprovements = async (userId) => {
  try {
    const token = await getToken();
    const res = await axios.get(`${PROGRESS_URL}/health/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching health improvements:', error);
    throw error;
  }
};

// Ghi nhận cảm nhận sức khỏe
export const recordHealthStatus = async (data) => {
  try {
    const token = await getToken();
    const res = await axios.post(`${PROGRESS_URL}/health`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error('Error recording health status:', error);
    throw error;
  }
};

// ==========================================
// STATISTICS APIs
// ==========================================

// Lấy thống kê tiết kiệm tiền
export const getMoneySavedStats = async (userId) => {
  try {
    const token = await getToken();
    const res = await axios.get(`${PROGRESS_URL}/money-saved/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching money saved stats:', error);
    throw error;
  }
};

// Lấy thống kê số điếu thuốc tránh được
export const getCigarettesAvoidedStats = async (userId) => {
  try {
    const token = await getToken();
    const res = await axios.get(`${PROGRESS_URL}/cigarettes-avoided/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching cigarettes avoided stats:', error);
    throw error;
  }
};