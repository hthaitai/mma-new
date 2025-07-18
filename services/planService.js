import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.0.2.2:8080/api';
const SMOKING_STATUS_URL = `${BASE_URL}/smoking-status`;
const QUIT_PLAN_URL = `${BASE_URL}/quitPlan`;

// Lấy token từ AsyncStorage
const getToken = async () => await AsyncStorage.getItem('token');

// ==========================================
// SMOKING STATUS APIs
// ==========================================
export const getStatusSmoking = async (id, token) => {
  try {
    console.log('🚀 [API] Getting smoking status for user:', id);

    const response = await axios.get(`${SMOKING_STATUS_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('✅ [API] Get smoking status success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [API] Error getting smoking status:');
    console.error('URL:', `${SMOKING_STATUS_URL}/${id}`);
    console.error('UserId:', id);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

export const createStatusSmoking = async (id, token, formData) => {
  try {
    console.log(
      '🚀 [API] Creating smoking status for user:',
      id,
      'with data:',
      formData
    );

    const response = await axios.post(`${SMOKING_STATUS_URL}/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('✅ [API] Create smoking status success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [API] Error creating smoking status:');
    console.error('URL:', `${SMOKING_STATUS_URL}/${id}`);
    console.error('UserId:', id);
    console.error('Data sent:', formData);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// ==========================================
// QUIT PLAN APIs
// ==========================================

// Tạo kế hoạch cai thuốc mới
export const createQuitPlan = async (planData) => {
  try {
    const token = await getToken();
    console.log('🚀 [API] Creating quit plan with data:', planData);

    const response = await axios.post(`${QUIT_PLAN_URL}`, planData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('✅ [API] Create quit plan success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [API] Error creating quit plan:');
    console.error('URL:', `${QUIT_PLAN_URL}`);
    console.error('Data sent:', planData);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error message:', error.message);
    throw error;
  }
};

// Lấy kế hoạch cai thuốc của user
export const getUserQuitPlan = async (userId) => {
  try {
    const token = await getToken();
    console.log('🚀 [API] Getting quit plans for user:', userId);

    const response = await axios.get(`${QUIT_PLAN_URL}/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('✅ [API] Get quit plans success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [API] Error fetching quit plan:');
    console.error('URL:', `${QUIT_PLAN_URL}/user/${userId}`);
    console.error('UserId:', userId);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Cập nhật kế hoạch cai thuốc
export const updateQuitPlan = async (planId, planData) => {
  try {
    const token = await getToken();
    console.log('🚀 [API] Updating quit plan:', planId, 'with data:', planData);

    const response = await axios.put(`${QUIT_PLAN_URL}/${planId}`, planData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('✅ [API] Update quit plan success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [API] Error updating quit plan:');
    console.error('URL:', `${QUIT_PLAN_URL}/${planId}`);
    console.error('PlanId:', planId);
    console.error('Data sent:', planData);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Xóa kế hoạch cai thuốc
export const deleteQuitPlan = async (planId) => {
  try {
    const token = await getToken();
    console.log('🚀 [API] Deleting quit plan:', planId);

    const response = await axios.delete(`${QUIT_PLAN_URL}/${planId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('✅ [API] Delete quit plan success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [API] Error deleting quit plan:');
    console.error('URL:', `${QUIT_PLAN_URL}/${planId}`);
    console.error('PlanId:', planId);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Lấy dashboard data cho user
export const getDashboardData = async (userId) => {
  try {
    const token = await getToken();
    console.log('🚀 [API] Getting dashboard data for user:', userId);

    const response = await axios.get(`http://10.0.2.2:8080/api/quitPlan/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('✅ [API] Get dashboard success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [API] Error fetching dashboard:');
    console.error('URL:', `${QUIT_PLAN_URL}/dashboard/${userId}`);
    console.error('UserId:', userId);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Hoàn thành task
export const completeTask = async (taskId) => {
  try {
    const token = await getToken();
    const response = await axios.post(
      `${QUIT_PLAN_URL}/task/${taskId}/complete`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      'Error completing task:',
      error.response?.data || error.message
    );
    throw error;
  }
};

// Cập nhật tiến trình stage
export const updateStageProgress = async (stageId, progressData) => {
  try {
    const token = await getToken();
    const response = await axios.put(
      `${QUIT_PLAN_URL}/stage/${stageId}/progress`,
      progressData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      'Error updating stage progress:',
      error.response?.data || error.message
    );
    throw error;
  }
};
