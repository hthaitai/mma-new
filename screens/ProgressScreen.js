import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, Alert, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { getAllProgress, createProgress } from '../services/progressService';
import axios from 'axios';
import { LineChart } from 'react-native-chart-kit';
import { BarChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';

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
  });
  const [allProgress, setAllProgress] = useState([]);
  const [latestHealth, setLatestHealth] = useState('');
  const [cigarettes, setCigarettes] = useState('');
  const [healthStatus, setHealthStatus] = useState('');
  const [stageList, setStageList] = useState([]);
  const [currentStageId, setCurrentStageId] = useState('');
  const [currentStage, setCurrentStage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy thông tin plan tổng thể
  const fetchPlan = async (userId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${API_PLAN_URL}/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && res.data.length > 0) {
        setPlan(res.data[0]);
      }
    } catch (err) {
      setPlan(null);
    }
  };

  // Lấy progress và stage
  const fetchData = async () => {
    setLoading(true);
    const userId = await getUserId();
    await fetchPlan(userId);
    try {
      const progress = await getAllProgress();
      setAllProgress(progress);
      // Lấy danh sách stage từ progress
      const stages = progress
        .map((p) => p.stage_id)
        .filter((s, idx, arr) => s && arr.findIndex(x => x._id === s._id) === idx);
      setStageList(stages);
      // Lấy stageId mới nhất
      if (stages.length > 0) {
        setCurrentStageId(stages[0]._id);
      } else {
        setCurrentStageId('');
      }
      // Tính toán số liệu tổng thể
      if (progress.length > 0) {
        // Số ngày không hút liên tục
        const sorted = [...progress].sort((a, b) => new Date(a.date) - new Date(b.date));
        const firstDate = new Date(sorted[0].date);
        const today = new Date();
        const daysSinceStart = Math.floor((today - firstDate) / (1000 * 60 * 60 * 24)) + 1;
        const totalMoney = progress.reduce((sum, p) => sum + (p.money_saved || 0), 0);
        setStats({
          consecutive_no_smoke_days: progress.length, // hoặc logic khác nếu có
          total_money_saved: totalMoney,
          days_since_start: daysSinceStart,
        });
        setLatestHealth(sorted[sorted.length - 1]?.health_status || '');
      } else {
        setStats({ consecutive_no_smoke_days: 0, total_money_saved: 0, days_since_start: 0 });
        setLatestHealth('');
      }
    } catch (err) {
      setAllProgress([]);
      setStats({ consecutive_no_smoke_days: 0, total_money_saved: 0, days_since_start: 0 });
      setLatestHealth('');
    }
    setLoading(false);
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
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
      {/* Card tổng thể plan */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Kế hoạch cai thuốc hoàn chỉnh</Text>
        {plan ? (
          <>
            <Text>Ngày bắt đầu: {new Date(plan.start_date).toLocaleDateString()}</Text>
            <Text>Ngày mục tiêu: {new Date(plan.target_quit_date).toLocaleDateString()}</Text>
            <Text>Lý do: {plan.reason}</Text>
            <TouchableOpacity
              style={styles.achievementButton}
              onPress={() => navigation.navigate('Achievements')}
            >
              <Text style={styles.achievementButtonText}>🏆 Xem thành tựu</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text>Chưa có kế hoạch</Text>
        )}
      </View>

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
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    margin: 12,
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
    marginBottom: 8,
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
    marginTop: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProgressScreen;
