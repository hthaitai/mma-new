import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, Alert, ScrollView, StyleSheet, Dimensions, TouchableOpacity, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import {
  getAllProgress,
  createProgress,
  getUserProgressStats,
  getAllStages,
  getStageById,
  updateStageProgress,
  recordHealthStatus
} from '../services/progressService';
import { getUserQuitPlan } from '../services/planService';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import { ProgressCard, TasksList, HealthImprovements } from '../components';
import { formatDate, calculateSavings, getMotivationMessage } from '../utils/helpers';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

const API_PLAN_URL = 'http://10.0.2.2:8080/api/quitPlan';
const API_STAGE_URL = 'http://10.0.2.2:8080/api/stages';

const getUserId = async () => {
  const userStr = await AsyncStorage.getItem('user');
  if (!userStr) return null;
  const user = JSON.parse(userStr);
  return user._id || user.id;
};

const ProgressScreen = () => {
  const navigation = useNavigation();
  const [plan, setPlan] = useState(null);
  const [stats, setStats] = useState({
    consecutive_no_smoke_days: 0,
    total_money_saved: 0,
    days_since_start: 0,
    completion_percentage: 0,
    completed_stages: 0,
    total_stages: 0,
  });
  const [allProgress, setAllProgress] = useState([]);
  const [healthImprovements, setHealthImprovements] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [latestHealth, setLatestHealth] = useState('');
  const [cigarettes, setCigarettes] = useState('');
  const [healthStatus, setHealthStatus] = useState('');
  const [stageList, setStageList] = useState([]);
  const [currentStageId, setCurrentStageId] = useState('');
  const [currentStage, setCurrentStage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [motivationMessage, setMotivationMessage] = useState('');

  // Lấy thông tin plan tổng thể
  const fetchPlan = async (userId) => {
    try {
      const plans = await getUserQuitPlan(userId);
      if (plans && plans.length > 0) {
        setPlan(plans[0]);
      } else {
        setPlan(null);
      }
    } catch (err) {
      console.error('Error fetching plan:', err);
      setPlan(null);
    }
  };

  // Lấy progress và stage
  const fetchData = async () => {
    setLoading(true);
    setRefreshing(false);
    
    try {
      const userId = await getUserId();
      if (!userId) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
        return;
      }

      // Fetch plan
      await fetchPlan(userId);

      // Fetch all progress
      const progress = await getAllProgress();
      setAllProgress(progress);

      // Fetch user progress stats
      try {
        const userStats = await getUserProgressStats(userId);
        setStats({
          consecutive_no_smoke_days: userStats.consecutive_no_smoke_days || 0,
          total_money_saved: userStats.total_money_saved || 0,
          days_since_start: userStats.days_since_start || 0,
          completion_percentage: userStats.completion_percentage || 0,
          completed_stages: userStats.completed_stages || 0,
          total_stages: userStats.total_stages || 0,
        });
        
        // Set motivation message based on days
        setMotivationMessage(getMotivationMessage(userStats.days_since_start || 0));
      } catch (statsError) {
        console.log('Error fetching user stats, using fallback calculation');
        // Fallback calculation if API doesn't exist yet
        if (progress.length > 0) {
          const sorted = [...progress].sort((a, b) => new Date(a.date) - new Date(b.date));
          const firstDate = new Date(sorted[0].date);
          const today = new Date();
          const daysSinceStart = Math.floor((today - firstDate) / (1000 * 60 * 60 * 24)) + 1;
          const totalMoney = progress.reduce((sum, p) => sum + (p.money_saved || 0), 0);
          
          setStats({
            consecutive_no_smoke_days: progress.length,
            total_money_saved: totalMoney,
            days_since_start: daysSinceStart,
            completion_percentage: 0,
            completed_stages: 0,
            total_stages: 1,
          });
          setMotivationMessage(getMotivationMessage(daysSinceStart));
        }
      }

      // Fetch stages
      try {
        const stages = await getAllStages();
        setStageList(stages);
        if (stages.length > 0) {
          setCurrentStageId(stages[0]._id);
        }
      } catch (stageError) {
        console.log('Error fetching stages:', stageError);
        // Fallback: get stages from progress
        const stagesFromProgress = progress
          .map((p) => p.stage_id)
          .filter((s, idx, arr) => s && arr.findIndex(x => x._id === s._id) === idx);
        setStageList(stagesFromProgress);
        if (stagesFromProgress.length > 0) {
          setCurrentStageId(stagesFromProgress[0]._id);
        }
      }

      // Set latest health status
      if (progress.length > 0) {
        const sorted = [...progress].sort((a, b) => new Date(b.date) - new Date(a.date));
        setLatestHealth(sorted[0]?.health_status || '');
      }

      // Mock upcoming tasks (would come from backend in real implementation)
      setUpcomingTasks([
        {
          _id: '1',
          title: 'Ghi nhận tiến trình hôm nay',
          description: 'Cập nhật số điếu thuốc đã hút và cảm giác sức khỏe',
          due_date: new Date().toISOString(),
          completed: false
        },
        {
          _id: '2',
          title: 'Uống nhiều nước',
          description: 'Uống ít nhất 8 ly nước để thải độc',
          completed: false
        }
      ]);

      // Mock health improvements
      setHealthImprovements([
        {
          title: 'Cải thiện hô hấp',
          description: 'Phổi bắt đầu tự làm sạch và loại bỏ đờm',
          timeline: '2-12 tuần',
          achieved: stats.days_since_start >= 14
        },
        {
          title: 'Giảm nguy cơ tim mạch',
          description: 'Nguy cơ mắc bệnh tim giảm đáng kể',
          timeline: '1 năm',
          achieved: stats.days_since_start >= 365
        }
      ]);

    } catch (err) {
      console.error('Error in fetchData:', err);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu tiến trình');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Lấy chi tiết stage hiện tại
  useEffect(() => {
    const fetchStage = async () => {
      if (!currentStageId) { setCurrentStage(null); return; }
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get(`${API_STAGE_URL}/${currentStageId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentStage(res.data);
      } catch (err) {
        setCurrentStage(null);
      }
    };
    fetchStage();
  }, [currentStageId]);

  useEffect(() => {
    fetchData();
  }, []);

  // Chuẩn bị dữ liệu cho line chart: số điếu hút theo ngày trong giai đoạn hiện tại
  let stageProgress = allProgress.filter(p => p.stage_id && (p.stage_id._id || p.stage_id) === currentStageId);
  // Group by date
  let chartLabels = [];
  let chartData = [];
  if (stageProgress.length > 0) {
    const byDate = {};
    stageProgress.forEach(p => {
      const d = new Date(p.date).toLocaleDateString();
      byDate[d] = (byDate[d] || 0) + (p.cigarettes_smoked || 0);
    });
    chartLabels = Object.keys(byDate);
    chartData = Object.values(byDate);
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Motivation Message */}
      {motivationMessage && (
        <View style={styles.motivationCard}>
          <Text style={styles.motivationText}>{motivationMessage}</Text>
        </View>
      )}

      {/* Card tổng thể plan */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎯 Kế hoạch cai thuốc</Text>
        {plan ? (
          <>
            <Text style={styles.planName}>{plan.name || 'Kế hoạch cai thuốc'}</Text>
            <Text style={styles.planDetail}>
              📅 {formatDate(plan.start_date)} - {formatDate(plan.target_quit_date)}
            </Text>
            <Text style={styles.planReason}>"{plan.reason}"</Text>
            
            <View style={styles.planActions}>
              <TouchableOpacity
                style={styles.achievementButton}
                onPress={() => navigation.navigate('Achievements')}
              >
                <Text style={styles.achievementButtonText}>🏆 Thành tựu</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dashboardButton}
                onPress={() => navigation.navigate('Dashboard')}
              >
                <Text style={styles.dashboardButtonText}>📊 Dashboard</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.noPlanContainer}>
            <Text style={styles.noPlanText}>Chưa có kế hoạch cai thuốc</Text>
            <TouchableOpacity
              style={styles.createPlanButton}
              onPress={() => navigation.navigate('Plan')}
            >
              <Text style={styles.createPlanButtonText}>Tạo kế hoạch ngay</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Progress Card */}
      <ProgressCard
        currentStage={currentStage}
        progressStats={stats}
      />

      {/* Health Improvements */}
      <HealthImprovements
        improvements={healthImprovements}
      />

      {/* Upcoming Tasks */}
      <TasksList
        tasks={upcomingTasks}
        onTaskComplete={(taskId) => {
          Alert.alert('Thành công', 'Đã hoàn thành nhiệm vụ!');
          // Update tasks list
          setUpcomingTasks(prev => prev.map(task =>
            task._id === taskId ? {...task, completed: true} : task
          ));
        }}
      />

      {/* Card stage hiện tại */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Giai đoạn hiện tại</Text>
        {currentStage ? (
          <>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Giai đoạn {currentStage.stage_number}: {currentStage.title}</Text>
            <Text>Mô tả: {currentStage.description}</Text>
            <Text>Ngày bắt đầu: {new Date(currentStage.start_date).toLocaleDateString()}</Text>
            <Text>Ngày kết thúc: {new Date(currentStage.end_date).toLocaleDateString()}</Text>
            <Text>Thứ tự: {currentStage.stage_number}</Text>
            {/* Bar chart số điếu hút theo ngày */}
            {chartLabels.length > 0 ? (
              <BarChart
                data={{
                  labels: chartLabels.map(d => d.split('/')[1]), // chỉ lấy ngày
                  datasets: [{ data: chartData }],
                }}
                width={screenWidth - 48}
                height={220}
                yAxisSuffix=" điếu"
                yAxisInterval={1}
                fromZero={true}
                showValuesOnTopOfBars={true}
                chartConfig={{
                  backgroundColor: '#fff',
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(33, 33, 33, ${opacity})`,
                  style: { borderRadius: 16 },
                  propsForBackgroundLines: {
                    stroke: '#e3e6ee',
                    strokeDasharray: '4',
                  },
                  propsForLabels: {
                    fontWeight: 'bold',
                  },
                  propsForHorizontalLabels: {
                    fontSize: 13,
                  },
                  propsForVerticalLabels: {
                    fontSize: 13,
                  },
                  barPercentage: 0.6,
                }}
                style={{ marginVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: '#e3e6ee', paddingRight: 8 }}
              />
            ) : (
              <Text style={{ color: '#888', marginTop: 8 }}>Chưa có dữ liệu tiến trình cho giai đoạn này</Text>
            )}
          </>
        ) : (
          <Text>Không xác định được giai đoạn hiện tại!</Text>
        )}
      </View>

      {/* Card lịch sử tiến trình */}
      {console.log('allProgress:', allProgress)}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Lịch sử tiến trình</Text>
        {allProgress.length === 0 ? (
          <Text style={{ color: '#888' }}>Chưa có tiến trình nào.</Text>
        ) : (
          allProgress.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).map((item, idx) => {
            let stageName = 'Bắt đầu cai thuốc';
            if (item.stage_id && typeof item.stage_id === 'object' && item.stage_id.title) {
              stageName = item.stage_id.title;
            } else if (typeof item.stage_id === 'string' && stageList.length > 0) {
              const found = stageList.find(s => (s._id || s.id) === item.stage_id);
              if (found && found.title) stageName = found.title;
            }
            return (
              <View key={item._id} style={{ marginBottom: 12, borderBottomWidth: idx === allProgress.length - 1 ? 0 : 1, borderColor: '#eee', paddingBottom: 8 }}>
                <Text style={{ fontWeight: 'bold', color: '#1976d2' }}>
                  Ngày: {new Date(item.date).toLocaleDateString()}
                </Text>
                <Text>Giai đoạn: {stageName}</Text>
                <Text>Số điếu hút: {item.cigarettes_smoked}</Text>
                <Text>Tiết kiệm: {item.money_saved} VNĐ</Text>
                <Text>Tình trạng sức khỏe: {item.health_status}</Text>
              </View>
            );
          })
        )}
      </View>

      {/* Card cập nhật tiến trình hôm nay */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Cập nhật tiến trình hôm nay</Text>
        <TextInput
          style={styles.input}
          placeholder="Số điếu hút hôm nay"
          keyboardType="numeric"
          value={cigarettes}
          onChangeText={setCigarettes}
        />
        <TextInput
          style={styles.input}
          placeholder="Tình trạng sức khỏe hôm nay"
          value={healthStatus}
          onChangeText={setHealthStatus}
        />
        <Button
          title="Ghi nhận tiến trình"
          onPress={async () => {
            if (!currentStageId) {
              Alert.alert('Lỗi', 'Chưa xác định được giai đoạn!');
              return;
            }
            try {
              await createProgress({
                stage_id: currentStageId,
                cigarettes_smoked: Number(cigarettes),
                health_status: healthStatus,
              });
              setCigarettes('');
              setHealthStatus('');
              fetchData();
              Alert.alert('Thành công', 'Đã ghi nhận tiến trình!');
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể ghi nhận tiến trình!');
            }
          }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  motivationCard: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: '#28a745',
  },
  motivationText: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196f3',
    marginBottom: 16,
    textAlign: 'center',
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  planDetail: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 8,
  },
  planReason: {
    fontSize: 16,
    color: '#495057',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
  },
  planActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  noPlanContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noPlanText: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 16,
  },
  createPlanButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  createPlanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196f3',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    backgroundColor: '#fafbfc',
  },
  achievementButton: {
    backgroundColor: '#2196f3',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
    marginHorizontal: 4,
  },
  achievementButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dashboardButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
    marginHorizontal: 4,
  },
  dashboardButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ProgressScreen;
