import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.0.2.2:8080/api';
const TASKS_URL = `${BASE_URL}/tasks`;

// Lấy token từ AsyncStorage
const getToken = async () => await AsyncStorage.getItem('token');

// ==========================================
// TASK MANAGEMENT APIs
// ==========================================

// Lấy tất cả tasks của user
export const getUserTasks = async (userId) => {
  try {
    const token = await getToken();
    console.log('🚀 [API] Getting all tasks for user:', userId);
    
    const response = await axios.get(`${TASKS_URL}/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ [API] Get user tasks success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [API] Error fetching user tasks:');
    console.error('URL:', `${TASKS_URL}/user/${userId}`);
    console.error('UserId:', userId);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Lấy upcoming tasks
export const getUpcomingTasks = async (userId, limit = 10) => {
  try {
    const token = await getToken();
    console.log('🚀 [API] Getting upcoming tasks for user:', userId, 'limit:', limit);
    
    const response = await axios.get(`${TASKS_URL}/user/${userId}/upcoming`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { limit }
    });
    
    console.log('✅ [API] Get upcoming tasks success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [API] Error fetching upcoming tasks:');
    console.error('URL:', `${TASKS_URL}/user/${userId}/upcoming`);
    console.error('UserId:', userId);
    console.error('Limit:', limit);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Lấy overdue tasks
export const getOverdueTasks = async (userId) => {
  try {
    const token = await getToken();
    console.log('🚀 [API] Getting overdue tasks for user:', userId);
    
    const response = await axios.get(`${TASKS_URL}/user/${userId}/overdue`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ [API] Get overdue tasks success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [API] Error fetching overdue tasks:');
    console.error('URL:', `${TASKS_URL}/user/${userId}/overdue`);
    console.error('UserId:', userId);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Tạo task mới (manual)
export const createTask = async (taskData) => {
  try {
    const token = await getToken();
    console.log('🚀 [API] Creating new task:', taskData);
    
    const response = await axios.post(`${TASKS_URL}`, taskData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ [API] Create task success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [API] Error creating task:');
    console.error('URL:', `${TASKS_URL}`);
    console.error('Data sent:', taskData);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Cập nhật task
export const updateTask = async (taskId, updateData) => {
  try {
    const token = await getToken();
    console.log('🚀 [API] Updating task:', taskId, 'with data:', updateData);
    
    const response = await axios.put(`${TASKS_URL}/${taskId}`, updateData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ [API] Update task success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [API] Error updating task:');
    console.error('URL:', `${TASKS_URL}/${taskId}`);
    console.error('TaskId:', taskId);
    console.error('Data sent:', updateData);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Đánh dấu task hoàn thành
export const completeTask = async (taskId) => {
  try {
    const token = await getToken();
    console.log('🚀 [API] Completing task:', taskId);
    
    const response = await axios.put(`${TASKS_URL}/${taskId}/complete`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ [API] Complete task success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [API] Error completing task:');
    console.error('URL:', `${TASKS_URL}/${taskId}/complete`);
    console.error('TaskId:', taskId);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Bỏ qua task
export const skipTask = async (taskId) => {
  try {
    const token = await getToken();
    console.log('🚀 [API] Skipping task:', taskId);
    
    const response = await axios.put(`${TASKS_URL}/${taskId}/skip`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ [API] Skip task success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [API] Error skipping task:');
    console.error('URL:', `${TASKS_URL}/${taskId}/skip`);
    console.error('TaskId:', taskId);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Xóa task
export const deleteTask = async (taskId) => {
  try {
    const token = await getToken();
    console.log('🚀 [API] Deleting task:', taskId);
    
    const response = await axios.delete(`${TASKS_URL}/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ [API] Delete task success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [API] Error deleting task:');
    console.error('URL:', `${TASKS_URL}/${taskId}`);
    console.error('TaskId:', taskId);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// ==========================================
// TASK GENERATION APIs
// ==========================================

// Tự động tạo tasks cho quit plan
export const generateTasksForQuitPlan = async (quitPlanId) => {
  try {
    const token = await getToken();
    console.log('🚀 [API] Generating tasks for quit plan:', quitPlanId);
    
    const response = await axios.post(`${TASKS_URL}/generate/${quitPlanId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ [API] Generate tasks success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [API] Error generating tasks:');
    console.error('URL:', `${TASKS_URL}/generate/${quitPlanId}`);
    console.error('QuitPlanId:', quitPlanId);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Tạo daily tasks
export const generateDailyTasks = async (userId) => {
  try {
    const token = await getToken();
    console.log('🚀 [API] Generating daily tasks for user:', userId);
    
    const response = await axios.post(`${TASKS_URL}/generate/daily/${userId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ [API] Generate daily tasks success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [API] Error generating daily tasks:');
    console.error('URL:', `${TASKS_URL}/generate/daily/${userId}`);
    console.error('UserId:', userId);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// ==========================================
// TASK TEMPLATES APIs
// ==========================================

// Lấy danh sách task templates
export const getTaskTemplates = async () => {
  try {
    const token = await getToken();
    console.log('🚀 [API] Getting task templates');
    
    const response = await axios.get(`${BASE_URL}/task-templates`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ [API] Get task templates success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [API] Error fetching task templates:');
    console.error('URL:', `${BASE_URL}/task-templates`);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Mock data fallback khi API chưa sẵn sàng
export const getMockUpcomingTasks = () => {
  return [
    {
      _id: '1',
      title: 'Ghi nhận tiến trình hôm nay',
      description: 'Cập nhật số điếu thuốc đã hút và cảm giác sức khỏe',
      task_type: 'daily',
      due_date: new Date().toISOString(),
      status: 'pending',
      priority: 'high',
      points_reward: 5,
      completed: false
    },
    {
      _id: '2',
      title: 'Uống đủ nước',
      description: 'Uống ít nhất 8 ly nước để thải độc nicotine',
      task_type: 'daily',
      due_date: new Date().toISOString(),
      status: 'pending',
      priority: 'medium',
      points_reward: 3,
      completed: false
    },
    {
      _id: '3',
      title: 'Thực hiện bài tập thở',
      description: 'Thở sâu 10 lần khi cảm thấy thèm thuốc',
      task_type: 'habit_building',
      due_date: new Date().toISOString(),
      status: 'pending',
      priority: 'medium',
      points_reward: 5,
      completed: false
    }
  ];
};

// Format task cho UI
export const formatTaskForUI = (task) => {
  return {
    ...task,
    formattedDueDate: task.due_date ? new Date(task.due_date).toLocaleDateString('vi-VN') : '',
    isOverdue: task.due_date ? new Date(task.due_date) < new Date() : false,
    priorityColor: {
      'low': '#28a745',
      'medium': '#ffc107', 
      'high': '#dc3545'
    }[task.priority] || '#6c757d'
  };
};