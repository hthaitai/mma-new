import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  RefreshControl,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getDashboardData, completeTask } from '../services/planService';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();

  const fetchDashboardData = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      const userId = userStr ? JSON.parse(userStr).id : null;
      
      // Kiểm tra xem có data từ navigation params không
      const { quitPlan, smokingStatus } = route.params || {};
      
      if (quitPlan && smokingStatus) {
        // Sử dụng data từ params nếu có
        console.log('Using data from navigation params');
        setDashboardData({
          quit_plan: quitPlan,
          smoking_status: smokingStatus,
          progress_stats: {
            money_saved: 0,
            cigarettes_avoided: 0,
            completion_percentage: 0,
            days_since_start: 0,
            completed_stages: 0,
            total_stages: 1,
            health_improvements: []
          },
          current_stage: null,
          upcoming_tasks: []
        });
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      if (userId) {
        const data = await getDashboardData(userId);
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      if (error.response?.status === 404) {
        Alert.alert('Thông báo', 'Bạn chưa có kế hoạch cai thuốc nào');
      } else {
        Alert.alert('Lỗi', 'Không thể tải thông tin dashboard');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await completeTask(taskId);
      Alert.alert('Thành công', 'Đã hoàn thành nhiệm vụ!');
      fetchDashboardData(); // Reload data
    } catch (error) {
      console.error('Error completing task:', error);
      Alert.alert('Lỗi', 'Không thể hoàn thành nhiệm vụ!');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#28a745" />
        <Text style={styles.loadingText}>Đang tải dashboard...</Text>
      </View>
    );
  }

  if (!dashboardData) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="clipboard-outline" size={64} color="#6c757d" />
        <Text style={styles.emptyText}>Không có dữ liệu dashboard</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header với thông tin kế hoạch */}
      <View style={styles.planCard}>
        <Text style={styles.planName}>
          🎯 {dashboardData.quit_plan?.name || 'Chưa có tên kế hoạch'}
        </Text>
        <Text style={styles.planReason}>
          "{dashboardData.quit_plan?.reason || 'Chưa có lý do'}"
        </Text>
        <View style={styles.planDatesContainer}>
          <Text style={styles.planDates}>
            📅 {dashboardData.quit_plan?.start_date ? formatDate(dashboardData.quit_plan.start_date) : '---'} - {dashboardData.quit_plan?.target_quit_date ? formatDate(dashboardData.quit_plan.target_quit_date) : '---'}
          </Text>
        </View>
      </View>

      {/* Thông tin smoking status */}
      {dashboardData.smoking_status && (
        <View style={styles.statusCard}>
          <Text style={styles.cardTitle}>🚬 Thông tin hút thuốc ban đầu</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusNumber}>
                {dashboardData.smoking_status.cigarettes_per_day}
              </Text>
              <Text style={styles.statusLabel}>điếu/ngày</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusNumber}>
                {dashboardData.progress_stats?.money_saved?.toLocaleString() || '0'}
              </Text>
              <Text style={styles.statusLabel}>VNĐ tiết kiệm</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusNumber}>
                {dashboardData.progress_stats?.cigarettes_avoided || 0}
              </Text>
              <Text style={styles.statusLabel}>điếu tránh được</Text>
            </View>
          </View>
        </View>
      )}

      {/* Progress Card */}
      <ProgressCard 
        currentStage={dashboardData.current_stage}
        progressStats={dashboardData.progress_stats}
      />

      {/* Health Improvements */}
      <HealthImprovements 
        improvements={dashboardData.progress_stats?.health_improvements || []}
      />

      {/* Upcoming Tasks */}
      <TasksList 
        tasks={dashboardData.upcoming_tasks || []}
        onTaskComplete={handleCompleteTask}
      />
    </ScrollView>
  );
};

// Component ProgressCard
const ProgressCard = ({ currentStage, progressStats }) => {
  if (!progressStats) return null;

  return (
    <View style={styles.progressCard}>
      <Text style={styles.cardTitle}>📈 Tiến độ hiện tại</Text>
      
      {currentStage && (
        <Text style={styles.stageName}>🎯 {currentStage.title}</Text>
      )}
      
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${progressStats.completion_percentage || 0}%` }
          ]} 
        />
      </View>
      
      <Text style={styles.progressText}>
        {progressStats.completion_percentage || 0}% hoàn thành
      </Text>
      
      <View style={styles.statsRow}>
        <Text style={styles.daysCount}>
          Ngày {progressStats.days_since_start || 0} / {progressStats.total_days || 0}
        </Text>
        <Text style={styles.stagesCount}>
          Giai đoạn {progressStats.completed_stages || 0} / {progressStats.total_stages || 0}
        </Text>
      </View>
    </View>
  );
};

// Component HealthImprovements
const HealthImprovements = ({ improvements }) => {
  if (!improvements || improvements.length === 0) return null;

  return (
    <View style={styles.healthCard}>
      <Text style={styles.cardTitle}>💊 Cải thiện sức khỏe</Text>
      {improvements.map((improvement, index) => (
        <View key={index} style={styles.healthItem}>
          <Text style={styles.healthTitle}>{improvement.title}</Text>
          <Text style={styles.healthDescription}>{improvement.description}</Text>
        </View>
      ))}
    </View>
  );
};

// Component TasksList
const TasksList = ({ tasks, onTaskComplete }) => {
  return (
    <View style={styles.tasksCard}>
      <Text style={styles.cardTitle}>✅ Nhiệm vụ sắp tới</Text>
      
      {tasks.map((task, index) => (
        <View key={task._id || index} style={styles.taskItem}>
          <View style={styles.taskContent}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskDescription}>{task.description}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.completeButton}
            onPress={() => onTaskComplete(task._id)}
          >
            <Text style={styles.completeButtonText}>Hoàn thành</Text>
          </TouchableOpacity>
        </View>
      ))}
      
      {tasks.length === 0 && (
        <Text style={styles.emptyTasksText}>🎉 Không có nhiệm vụ nào! Bạn đang làm rất tốt!</Text>
      )}
    </View>
  );
};

// Utility function
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#28a745',
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    textAlign: 'center',
    marginBottom: 8,
  },
  planReason: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  planDatesContainer: {
    alignItems: 'center',
  },
  planDates: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
  },
  statusLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  stageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007bff',
    textAlign: 'center',
    marginBottom: 16,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 6,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#28a745',
    borderRadius: 6,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  daysCount: {
    fontSize: 14,
    color: '#6c757d',
  },
  stagesCount: {
    fontSize: 14,
    color: '#6c757d',
  },
  healthCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  healthItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  healthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28a745',
    marginBottom: 4,
  },
  healthDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  tasksCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  taskItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  taskContent: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 18,
  },
  completeButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyTasksText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#28a745',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});