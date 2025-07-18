import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { getStatusSmoking, createStatusSmoking } from '../services/planService';
import SmokingForm from '../components/smokingstatusform';
import { Ionicons } from '@expo/vector-icons';

const PlanScreen = () => {
  const [smokingStatus, setSmokingStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const navigation = useNavigation();

  const fetchSmokingStatus = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      const id = userStr ? JSON.parse(userStr).id : null;
      if (id && token) {
        const data = await getStatusSmoking(id, token);
        console.log('Smoking status data:', data);
        if (data) {
          setSmokingStatus(data.smokingStatus || data);
        } else {
          setShowFormModal(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch smoking status:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSmokingStatus();
  }, []);

  const handleGoToUpdate = () => {
    navigation.navigate('UpdateSmokingForm');
  };

  const handleFormSubmit = async (formData) => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      const id = userStr ? JSON.parse(userStr).id : null;
      if (id && token) {
        await createStatusSmoking(id, token, formData);
        await fetchSmokingStatus(); // reload lại trạng thái
      }
    } catch (error) {
      console.error('Failed to create smoking status:', error.message);
    } finally {
      setShowFormModal(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Xóa nút chỉnh sửa ở góc phải trên, chỉ giữ lại icon bút chì trong card */}
      {/* <TouchableOpacity
        style={styles.editButton}
        onPress={() => setShowFormModal(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="pencil" size={22} color="#007bff" />
      </TouchableOpacity> */}

      {/* Nút nhập thông tin hút thuốc */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowFormModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>Nhập thông tin hút thuốc</Text>
      </TouchableOpacity>
      {smokingStatus ? (
        <View style={styles.card}>
          {/* Icon bút chì nằm trong card, góc phải trên */}
          <TouchableOpacity
            style={styles.editButtonInCard}
            onPress={() => setShowFormModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={18} color="#007bff" />
          </TouchableOpacity>
          <Text style={styles.title}>Thông tin hút thuốc</Text>
          <Text style={styles.info}>Số điếu/ngày: <Text style={styles.value}>{smokingStatus.cigarettes_per_day}</Text></Text>
          <Text style={styles.info}>Giá 1 bao: <Text style={styles.value}>{smokingStatus.cost_per_pack} VND</Text></Text>
          <Text style={styles.info}>
            Ngày bắt đầu: <Text style={styles.value}>{new Date(smokingStatus.start_date).toLocaleDateString()}</Text>
          </Text>
          <TouchableOpacity
            onPress={() => setShowFormModal(true)}
            style={styles.updateButton}
          >
            <Text style={styles.updateButtonText}>Cập nhật thông tin</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.noData}>Chưa có dữ liệu hút thuốc</Text>
      )}
      {/* Modal Form */}
      <SmokingForm
        visible={showFormModal}
        onSubmit={handleFormSubmit}
        onClose={() => setShowFormModal(false)}
      />
    </ScrollView>
  );
};

export default PlanScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#f4f8fb',
    alignItems: 'center',
    // justifyContent: 'center', // Xóa dòng này để không căn giữa theo chiều dọc
    paddingTop: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f8fb',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 16,
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  value: {
    fontWeight: 'bold',
    color: '#007bff',
  },
  updateButton: {
    marginTop: 24,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  noData: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 40,
  },
  editButton: {
    position: 'absolute',
    top: 18,
    right: 24,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  addButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginBottom: 18,
    marginTop: 8,
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  editButtonInCard: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: '#f4f8fb',
    borderRadius: 14,
    padding: 3,
    elevation: 2,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
  },
});
