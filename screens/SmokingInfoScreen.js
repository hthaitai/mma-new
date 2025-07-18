import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { createStatusSmoking } from '../services/planService';
import { Ionicons } from '@expo/vector-icons';

const SmokingInfoScreen = () => {
  const navigation = useNavigation();
  const [smokingData, setSmokingData] = useState({
    cigarettes_per_day: '',
    cost_per_pack: '',
    start_date: new Date()
  });
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Validate input
      if (!smokingData.cigarettes_per_day || !smokingData.cost_per_pack) {
        Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
        return;
      }

      if (parseInt(smokingData.cigarettes_per_day) <= 0) {
        Alert.alert('Lỗi', 'Số điếu thuốc phải lớn hơn 0');
        return;
      }

      if (parseInt(smokingData.cost_per_pack) <= 0) {
        Alert.alert('Lỗi', 'Giá bao thuốc phải lớn hơn 0');
        return;
      }

      // Get user info
      const userStr = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      const userId = userStr ? JSON.parse(userStr).id : null;

      if (!userId || !token) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
        return;
      }

      // API Call: Tạo smoking status
      const response = await createStatusSmoking(userId, token, {
        cigarettes_per_day: parseInt(smokingData.cigarettes_per_day),
        cost_per_pack: parseInt(smokingData.cost_per_pack),
        start_date: smokingData.start_date.toISOString()
      });

      console.log('Smoking status response:', response);

      Alert.alert(
        'Thành công!',
        'Thông tin hút thuốc đã được lưu',
        [
          {
            text: 'Tiếp tục tạo kế hoạch',
            onPress: () => {
              // Navigate to Plan screen và tự động mở modal tạo kế hoạch
              navigation.navigate('MainApp', {
                screen: 'Kế hoạch',
                params: {
                  openCreateModal: true,
                  smokingStatus: response.smokingStatus || response
                }
              });
            }
          },
          {
            text: 'Quay lại',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error creating smoking status:', error);
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể lưu thông tin');
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyCost = () => {
    if (!smokingData.cigarettes_per_day || !smokingData.cost_per_pack) return 0;
    const packsPerDay = parseInt(smokingData.cigarettes_per_day) / 20;
    const dailyCost = packsPerDay * parseInt(smokingData.cost_per_pack);
    return dailyCost * 30;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007bff" />
        </TouchableOpacity>
        <Text style={styles.title}>Thông tin hút thuốc của bạn</Text>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Số điếu thuốc/ngày *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: 20"
          value={smokingData.cigarettes_per_day}
          onChangeText={(text) => setSmokingData({...smokingData, cigarettes_per_day: text})}
          keyboardType="numeric"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Giá tiền/bao (VNĐ) *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: 50000"
          value={smokingData.cost_per_pack}
          onChangeText={(text) => setSmokingData({...smokingData, cost_per_pack: text})}
          keyboardType="numeric"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Ngày bắt đầu hút thuốc</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            📅 {smokingData.start_date.toLocaleDateString('vi-VN')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hiển thị ước tính chi phí */}
      {smokingData.cigarettes_per_day && smokingData.cost_per_pack && (
        <View style={styles.costEstimateCard}>
          <Text style={styles.costEstimateTitle}>💰 Ước tính chi phí</Text>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Chi phí/tháng:</Text>
            <Text style={styles.costValue}>
              {calculateMonthlyCost().toLocaleString()} VNĐ
            </Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Chi phí/năm:</Text>
            <Text style={styles.costValue}>
              {(calculateMonthlyCost() * 12).toLocaleString()} VNĐ
            </Text>
          </View>
        </View>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={smokingData.start_date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setSmokingData({...smokingData, start_date: selectedDate});
            }
          }}
        />
      )}
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Đang lưu...' : '💾 Lưu và tiếp tục'}
        </Text>
      </TouchableOpacity>

      <View style={styles.helpCard}>
        <Text style={styles.helpTitle}>💡 Lưu ý</Text>
        <Text style={styles.helpText}>
          • Thông tin này sẽ giúp tính toán kế hoạch cai thuốc phù hợp{'\n'}
          • Bạn có thể cập nhật thông tin này bất cứ lúc nào{'\n'}
          • Dữ liệu được bảo mật và chỉ dùng để hỗ trợ bạn cai thuốc
        </Text>
      </View>
    </ScrollView>
  );
};

export default SmokingInfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  costEstimateCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#ffc107',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  costEstimateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e67e22',
    marginBottom: 12,
    textAlign: 'center',
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 16,
    color: '#6c757d',
  },
  costValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e67e22',
  },
  button: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helpCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2196f3',
    marginBottom: 24,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
});