import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import {
  getStatusSmoking,
  createStatusSmoking,
  createQuitPlan,
  getUserQuitPlan,
  updateQuitPlan,
  deleteQuitPlan,
  getDashboardData
} from '../services/planService';
import SmokingForm from '../components/smokingstatusform';
import QuitPlanForm from '../components/quitplanform';
import { Ionicons } from '@expo/vector-icons';

const PlanScreen = ({ route }) => {
  const [smokingStatusList, setSmokingStatusList] = useState([]);
  const [quitPlan, setQuitPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showQuitPlanModal, setShowQuitPlanModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
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
    }
  };

  const fetchQuitPlan = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      const id = userStr ? JSON.parse(userStr).id : null;
      if (id) {
        const plans = await getUserQuitPlan(id);
        if (plans && plans.length > 0) {
          setQuitPlan(plans[0]);
        } else {
          setQuitPlan(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch quit plan:', error.message);
      setQuitPlan(null);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchSmokingStatus(), fetchQuitPlan()]);
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Xử lý params từ navigation (từ SmokingInfoScreen)
  useEffect(() => {
    if (route?.params?.openCreateModal) {
      console.log('🎯 Auto-opening create plan modal from navigation params');
      setEditMode(false);
      setShowQuitPlanModal(true);
      
      // Clear params sau khi sử dụng
      navigation.setParams({ openCreateModal: false });
    }
  }, [route?.params?.openCreateModal]);

  const handleFormSubmit = async (formData) => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      const id = userStr ? JSON.parse(userStr).id : null;
      if (id && token) {
        await createStatusSmoking(id, token, formData);
        await fetchSmokingStatus(); // reload lại trạng thái
        Alert.alert('Thành công', 'Đã cập nhật thông tin hút thuốc!');
      }
    } catch (error) {
      console.error('Failed to create smoking status:', error.message);
      Alert.alert('Lỗi', 'Không thể lưu thông tin hút thuốc!');
    } finally {
      setShowFormModal(false);
    }
  };

  const handleQuitPlanSubmit = async (planData) => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      const id = userStr ? JSON.parse(userStr).id : null;
      if (id) {
        // Thêm user_id vào planData
        const dataToSend = { ...planData, user_id: id };
        
        let result;
        if (editMode && quitPlan) {
          // Cập nhật kế hoạch hiện tại
          result = await updateQuitPlan(quitPlan._id, dataToSend);
          Alert.alert('Thành công', 'Đã cập nhật kế hoạch cai thuốc!');
          // Với update, result có thể là quit plan trực tiếp
          setQuitPlan(result);
        } else {
          // Tạo kế hoạch mới
          result = await createQuitPlan(dataToSend);
          // Backend trả về: { quit_plan, smoking_status, message }
          console.log('Create quit plan result:', result);
          Alert.alert('Thành công', result.message || 'Đã tạo kế hoạch cai thuốc!');
          
          // Lưu quit plan từ response
          if (result.quit_plan) {
            setQuitPlan(result.quit_plan);
          }
        }
        
        await fetchQuitPlan(); // Reload data
      }
    } catch (error) {
      console.error('Failed to save quit plan:', error.message);
      Alert.alert('Lỗi', editMode ? 'Không thể cập nhật kế hoạch!' : 'Không thể tạo kế hoạch cai thuốc!');
    } finally {
      setShowQuitPlanModal(false);
      setEditMode(false);
    }
  };

  const handleDeletePlan = () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa kế hoạch cai thuốc này? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteQuitPlan(quitPlan._id);
              setQuitPlan(null);
              Alert.alert('Thành công', 'Đã xóa kế hoạch cai thuốc!');
            } catch (error) {
              console.error('Failed to delete quit plan:', error.message);
              Alert.alert('Lỗi', 'Không thể xóa kế hoạch!');
            }
          }
        }
      ]
    );
  };

  const openEditPlanModal = () => {
    setEditMode(true);
    setShowQuitPlanModal(true);
  };

  const openCreatePlanModal = () => {
    setEditMode(false);
    setShowQuitPlanModal(true);
  };

  // Tính toán tiền tiết kiệm dự kiến
  const calculateMonthlySavings = () => {
    if (smokingStatusList.length === 0) return 0;
    const currentStatus = smokingStatusList[0];
    const packsPerDay = currentStatus.cigarettes_per_day / 20;
    const dailyCost = packsPerDay * currentStatus.cost_per_pack;
    return dailyCost * 30;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Hiển thị thông tin tiết kiệm tiềm năng */}
      {smokingStatusList.length > 0 && (
        <View style={styles.savingsCard}>
          <Text style={styles.savingsTitle}>💰 Tiềm năng tiết kiệm</Text>
          <Text style={styles.savingsAmount}>
            {calculateMonthlySavings().toLocaleString()} VNĐ/tháng
          </Text>
          <Text style={styles.savingsNote}>
            Khi bạn bỏ thuốc hoàn toàn
          </Text>
        </View>
      )}

      {/* Nút nhập thông tin hút thuốc */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowFormModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>📝 Nhập thông tin hút thuốc</Text>
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

      {/* Phần Kế hoạch cai thuốc */}
      <View style={styles.planSection}>
        <Text style={styles.planSectionTitle}>Kế hoạch cai thuốc</Text>
        
        {quitPlan ? (
          <View style={styles.quitPlanCard}>
            <View style={styles.planActionButtons}>
              <TouchableOpacity
                style={styles.editPlanButton}
                onPress={openEditPlanModal}
                activeOpacity={0.7}
              >
                <Ionicons name="pencil" size={16} color="#28a745" />
                <Text style={styles.editPlanButtonText}>Chỉnh sửa</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.deletePlanButton}
                onPress={handleDeletePlan}
                activeOpacity={0.7}
              >
                <Ionicons name="trash" size={16} color="#dc3545" />
                <Text style={styles.deletePlanButtonText}>Xóa</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.quitPlanTitle}>🎯 Kế hoạch cai thuốc của tôi</Text>
            <Text style={styles.info}>
              Ngày bắt đầu: <Text style={styles.value}>{new Date(quitPlan.start_date).toLocaleDateString('vi-VN')}</Text>
            </Text>
            <Text style={styles.info}>
              Ngày mục tiêu: <Text style={styles.value}>{new Date(quitPlan.target_quit_date).toLocaleDateString('vi-VN')}</Text>
            </Text>
            <Text style={styles.info}>
              Lý do: <Text style={styles.reasonText}>{quitPlan.reason}</Text>
            </Text>
            <Text style={styles.info}>
              Ngày tạo: <Text style={styles.value}>{new Date(quitPlan.createdAt).toLocaleDateString('vi-VN')}</Text>
            </Text>
            
            <View style={styles.planButtonRow}>
              <TouchableOpacity
                style={styles.progressButton}
                onPress={() => navigation.navigate('MainApp', { screen: 'Tiến trình' })}
              >
                <Text style={styles.progressButtonText}>📊 Xem tiến trình</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dashboardButton}
                onPress={() => navigation.navigate('Dashboard', { userId: JSON.parse(AsyncStorage.getItem('user') || '{}').id })}
              >
                <Text style={styles.dashboardButtonText}>🎯 Dashboard</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.noPlanCard}>
            <Text style={styles.noPlanText}>Chưa có kế hoạch cai thuốc</Text>
            <Text style={styles.noPlanSubText}>
              {smokingStatusList.length > 0
                ? "Hãy tạo kế hoạch cai thuốc để bắt đầu hành trình của bạn!"
                : "Vui lòng nhập thông tin hút thuốc trước khi tạo kế hoạch"
              }
            </Text>
            
            {smokingStatusList.length > 0 && (
              <TouchableOpacity
                style={styles.createPlanButton}
                onPress={openCreatePlanModal}
                activeOpacity={0.8}
              >
                <Text style={styles.createPlanButtonText}>🎯 Tạo kế hoạch cai thuốc</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Modal Forms */}
      <SmokingForm
        visible={showFormModal}
        onSubmit={handleFormSubmit}
        onClose={() => setShowFormModal(false)}
      />
      
      {showQuitPlanModal && (
        <QuitPlanForm
          visible={showQuitPlanModal}
          onSubmit={handleQuitPlanSubmit}
          onClose={() => {
            setShowQuitPlanModal(false);
            setEditMode(false);
          }}
          currentSmokingStatus={
            route?.params?.smokingStatus || smokingStatusList[0]
          }
          editMode={editMode}
          existingPlan={editMode ? quitPlan : null}
        />
      )}
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
  planSection: {
    width: '100%',
    maxWidth: 400,
    marginTop: 20,
  },
  planSectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 16,
    textAlign: 'center',
  },
  quitPlanCard: {
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
    borderWidth: 2,
    borderColor: '#28a745',
  },
  quitPlanTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 16,
    textAlign: 'center',
  },
  noPlanCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
    alignItems: 'center',
  },
  noPlanText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6c757d',
    marginBottom: 8,
    textAlign: 'center',
  },
  noPlanSubText: {
    fontSize: 14,
    color: '#868e96',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  createPlanButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  createPlanButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  startPlanButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 20,
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  startPlanButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  // Styles mới cho các tính năng được thêm
  savingsCard: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#28a745',
  },
  savingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 8,
  },
  savingsAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 4,
  },
  savingsNote: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  planActionButtons: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
    zIndex: 10,
  },
  editPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#28a745',
  },
  editPlanButtonText: {
    color: '#28a745',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  deletePlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  deletePlanButtonText: {
    color: '#dc3545',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  reasonText: {
    fontWeight: '500',
    color: '#495057',
    fontStyle: 'italic',
  },
  planButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  progressButton: {
    flex: 1,
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  progressButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dashboardButton: {
    flex: 1,
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dashboardButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
