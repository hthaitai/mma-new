import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TextInput, TouchableOpacity, Modal, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]); // Danh sách user cho coach
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ userId: '', progressId: '', message: '', type: '', schedule: '' });
  const [editing, setEditing] = useState(null); // Thông báo đang chỉnh sửa
  const [showEdit, setShowEdit] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [date, setDate] = useState(null);

  useEffect(() => {
    (async () => {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) return;
      const userObj = JSON.parse(userData);
      setUser(userObj);
      if (userObj.role === 'coach') {
        fetchAllNotifications(userObj.token);
        fetchAllUsers(userObj.token);
      } else {
        fetchNotificationsByUser(userObj.id, userObj.token);
      }
    })();
  }, []);

  // Lấy tất cả user (cho coach chọn khi tạo thông báo)
  const fetchAllUsers = async (token) => {
    try {
      const res = await fetch('http://192.168.243.1:5000/api/user/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch {}
  };

  // Coach: lấy tất cả thông báo
  const fetchAllNotifications = async (token) => {
    try {
      setLoading(true);
      const res = await fetch('http://192.168.243.1:5000/api/notification/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setNotifications(Array.isArray(data) ? data : []);
      else setNotifications([]);
    } catch { setNotifications([]); }
    finally { setLoading(false); }
  };

  // User: lấy thông báo của mình
  const fetchNotificationsByUser = async (userId, token) => {
    try {
      setLoading(true);
      const res = await fetch(`http://192.168.243.1:5000/api/notification/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setNotifications(Array.isArray(data) ? data : []);
      else setNotifications([]);
    } catch { setNotifications([]); }
    finally { setLoading(false); }
  };

  // Tạo thông báo mới (coach)
  const handleCreate = async () => {
    if (!form.userId || !form.message || !form.type || !form.schedule) {
      Alert.alert('Vui lòng nhập đủ thông tin');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('http://192.168.243.1:5000/api/notification/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          progress_id: form.progressId, // Nếu có
          message: form.message,
          type: form.type,
          schedule: form.schedule,
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShowCreate(false);
        fetchAllNotifications(user.token);
        setForm({ userId: '', progressId: '', message: '', type: '', schedule: '' });
        Alert.alert('Thành công', 'Đã tạo thông báo!');
      } else {
        Alert.alert('Lỗi', data.error || 'Không tạo được thông báo');
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể kết nối server');
    } finally { setLoading(false); }
  };

  // Chỉnh sửa thông báo (coach)
  const handleEdit = async () => {
    if (!editing) return;
    try {
      setLoading(true);
      const res = await fetch(`http://192.168.243.1:5000/api/notification/${editing._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          message: editing.message,
          type: editing.type,
          schedule: editing.schedule,
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShowEdit(false);
        fetchAllNotifications(user.token);
        Alert.alert('Thành công', 'Đã cập nhật thông báo!');
      } else {
        Alert.alert('Lỗi', data.error || 'Không cập nhật được thông báo');
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể kết nối server');
    } finally { setLoading(false); }
  };

  // Khi chọn ngày giờ
  const handleDateConfirm = (selectedDate) => {
    setDatePickerVisibility(false);
    if (selectedDate) {
      setDate(selectedDate);
      setForm(f => ({ ...f, schedule: selectedDate.toISOString() }));
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#26a69a" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Icon name="notifications" size={28} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.header}>Thông báo / Nhắc nhở</Text>
        {user?.role === 'coach' && (
          <TouchableOpacity onPress={() => setShowCreate(true)} style={{ marginLeft: 'auto' }}>
            <Icon name="add-circle" size={32} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
      {/* Form tạo mới (coach) */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <View style={stylesModal.modalBg}>
          <View style={stylesModal.modalCard}>
            <View style={{ alignItems: 'center', marginBottom: 10 }}>
              <Icon name="add-circle" size={38} color="#26a69a" />
              <Text style={stylesModal.title}>Tạo thông báo mới</Text>
            </View>
            <Text style={stylesModal.label}>Nội dung</Text>
            <TextInput placeholder="Nội dung" value={form.message} onChangeText={t => setForm(f => ({ ...f, message: t }))} style={stylesModal.input} />
            <Text style={stylesModal.label}>Loại</Text>
            <TextInput placeholder="Loại" value={form.type} onChangeText={t => setForm(f => ({ ...f, type: t }))} style={stylesModal.input} />
            <Text style={stylesModal.label}>Lịch</Text>
            <TouchableOpacity style={stylesModal.input} onPress={() => setDatePickerVisibility(true)}>
              <Text style={{ color: form.schedule ? '#222' : '#aaa', fontSize: 16 }}>
                {date ? new Date(date).toLocaleString() : 'Chọn ngày giờ'}
              </Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="datetime"
              onConfirm={handleDateConfirm}
              onCancel={() => setDatePickerVisibility(false)}
              date={date ? new Date(date) : new Date()}
              minimumDate={new Date()}
            />
            <View style={stylesModal.btnRow}>
              <TouchableOpacity style={[stylesModal.btn, { backgroundColor: '#bdbdbd' }]} onPress={() => setShowCreate(false)}>
                <Text style={stylesModal.btnText}>HỦY</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[stylesModal.btn, { backgroundColor: '#26a69a' }]} onPress={handleCreate}>
                <Text style={stylesModal.btnText}>TẠO</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Form chỉnh sửa (coach) */}
      <Modal visible={showEdit} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>Chỉnh sửa thông báo</Text>
            <TextInput placeholder="Nội dung" value={editing?.message} onChangeText={t => setEditing(e => ({ ...e, message: t }))} style={styles.input} />
            <TextInput placeholder="Loại" value={editing?.type} onChangeText={t => setEditing(e => ({ ...e, type: t }))} style={styles.input} />
            <TextInput placeholder="Lịch (YYYY-MM-DD HH:mm)" value={editing?.schedule} onChangeText={t => setEditing(e => ({ ...e, schedule: t }))} style={styles.input} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <Button title="Hủy" onPress={() => setShowEdit(false)} />
              <Button title="Lưu" onPress={handleEdit} />
            </View>
          </View>
        </View>
      </Modal>
      {/* Danh sách thông báo */}
      {notifications.length === 0 ? (
        <View style={styles.center}><Text>Không có thông báo nào</Text></View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => user?.role === 'coach' ? (setEditing(item), setShowEdit(true)) : null}
              style={styles.card}
            >
              <Icon name="notifications-outline" size={32} color="#42a5f5" style={styles.icon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.text}>{item.message}</Text>
                <Text style={styles.subtext}>Loại: {item.type}</Text>
                <Text style={styles.subtext}>Lịch: {new Date(item.schedule).toLocaleString()}</Text>
                <Text style={styles.subtext}>Đã gửi: {item.is_sent ? '✔️' : '❌'}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item, idx) => item._id ? item._id.toString() : idx.toString()}
          contentContainerStyle={{ paddingVertical: 16 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#42a5f5',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    marginBottom: 8,
  },
  header: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    borderLeftWidth: 6,
    borderLeftColor: '#42a5f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: { marginRight: 16 },
  text: { fontSize: 17, color: '#222', fontWeight: '500' },
  subtext: { fontSize: 13, color: '#666' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12, backgroundColor: '#fff' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: 320 },
});

const stylesModal = StyleSheet.create({
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', justifyContent: 'center', alignItems: 'center' },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    width: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'center',
  },
  label: {
    fontSize: 15,
    color: '#888',
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    backgroundColor: '#fafbfc',
    fontSize: 16,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 22,
  },
  btn: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 1,
  },
}); 