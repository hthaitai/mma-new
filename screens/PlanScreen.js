import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { getStatusSmoking, createStatusSmoking } from '../services/planService';
import SmokingForm from '../components/smokingstatusform';
import { Ionicons } from '@expo/vector-icons';

const PlanScreen = () => {
  const [smokingStatusList, setSmokingStatusList] = useState([]);
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
        if (data && data.smokingStatus && Array.isArray(data.smokingStatus)) {
          // Sắp xếp theo thời gian tạo mới nhất
          const sortedData = data.smokingStatus.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setSmokingStatusList(sortedData);
        } else if (data && Array.isArray(data)) {
          const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setSmokingStatusList(sortedData);
        } else {
          setSmokingStatusList([]);
          setShowFormModal(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch smoking status:', error.message);
      setSmokingStatusList([]);
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
      {smokingStatusList.length > 0 ? (
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Lịch sử thông tin hút thuốc</Text>
          {smokingStatusList.map((status, index) => (
            <View key={status._id} style={[styles.card, index === 0 && styles.latestCard]}>
              {/* Icon bút chì chỉ hiện ở record mới nhất */}
              {index === 0 && (
                <TouchableOpacity
                  style={styles.editButtonInCard}
                  onPress={() => setShowFormModal(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="pencil" size={18} color="#007bff" />
                </TouchableOpacity>
              )}
              
              {/* Badge cho record mới nhất */}
              {index === 0 && (
                <View style={styles.latestBadge}>
                  <Text style={styles.latestBadgeText}>Mới nhất</Text>
                </View>
              )}
              
              <Text style={[styles.title, index === 0 ? styles.latestTitle : styles.historyTitle]}>
                {index === 0 ? 'Thông tin hút thuốc hiện tại' : `Lần cập nhật #${smokingStatusList.length - index}`}
              </Text>
              
              <Text style={styles.info}>
                Số điếu/ngày: <Text style={styles.value}>{status.cigarettes_per_day}</Text>
              </Text>
              <Text style={styles.info}>
                Giá 1 bao: <Text style={styles.value}>{status.cost_per_pack.toLocaleString()} VND</Text>
              </Text>
              <Text style={styles.info}>
                Ngày bắt đầu: <Text style={styles.value}>{new Date(status.start_date).toLocaleDateString('vi-VN')}</Text>
              </Text>
              <Text style={styles.info}>
                Ngày tạo: <Text style={styles.value}>{new Date(status.createdAt).toLocaleDateString('vi-VN')} {new Date(status.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</Text>
              </Text>
              
              {/* Nút cập nhật chỉ hiện ở record mới nhất */}
              {index === 0 && (
                <TouchableOpacity
                  onPress={() => setShowFormModal(true)}
                  style={styles.updateButton}
                >
                  <Text style={styles.updateButtonText}>Cập nhật thông tin</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
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
  listContainer: {
    width: '100%',
    maxWidth: 400,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 16,
    position: 'relative',
  },
  latestCard: {
    borderWidth: 2,
    borderColor: '#007bff',
    shadowColor: '#007bff',
    shadowOpacity: 0.2,
    elevation: 8,
  },
  latestBadge: {
    position: 'absolute',
    top: -8,
    left: 16,
    backgroundColor: '#007bff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    zIndex: 10,
  },
  latestBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  latestTitle: {
    color: '#007bff',
    fontSize: 20,
  },
  historyTitle: {
    color: '#666',
    fontSize: 16,
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
