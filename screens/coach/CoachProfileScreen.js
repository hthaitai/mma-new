import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, ScrollView, Alert, TextInput, Modal, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

export default function CoachProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  // State cho form tạo/sửa
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        fetchProfile(userObj.id, userObj.token);
      }
    })();
  }, []);

  const fetchProfile = async (userId, token) => {
    try {
      setLoading(true);
      const res = await fetch(`http://192.168.243.1:5000/api/coach/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setSpecialization(data.specialization || '');
        setExperience(data.experience_years ? String(data.experience_years) : '');
        setBio(data.bio || '');
      } else {
        setProfile(null);
      }
    } catch (err) {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // Tạo mới profile
  const handleCreateProfile = async () => {
    if (!specialization || !experience || !bio) {
      Alert.alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('http://192.168.243.1:5000/api/coach/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          specialization,
          experience_years: Number(experience),
          bio,
        })
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setShowCreate(false);
        Alert.alert('Thành công', 'Đã tạo hồ sơ coach!');
      } else {
        Alert.alert('Lỗi', data.message || 'Không tạo được hồ sơ');
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể kết nối server');
    } finally {
      setLoading(false);
    }
  };

  // Chỉnh sửa profile
  const handleEditProfile = async () => {
    if (!profile) return;
    // Ưu tiên coach_id (user id), fallback sang _id hoặc id nếu cần
    let profileId = profile.coach_id || profile._id || profile.id;
    if (typeof profileId === 'object' && profileId !== null) {
      profileId = profileId._id || profileId.id || profileId.toString();
    }
    if (!profileId) {
      Alert.alert('Lỗi', 'Không xác định được ID hồ sơ coach');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`http://192.168.243.1:5000/api/coach/${profileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          specialization,
          experience_years: Number(experience),
          bio,
        })
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setEditMode(false);
        Alert.alert('Thành công', 'Đã cập nhật hồ sơ!');
      } else {
        Alert.alert('Lỗi', data.message || 'Không cập nhật được hồ sơ');
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể kết nối server');
    } finally {
      setLoading(false);
    }
  };

  // Xóa profile
  const handleDeleteProfile = async () => {
    if (!profile) return;
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa hồ sơ?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: async () => {
        try {
          setLoading(true);
          const res = await fetch(`http://192.168.243.1:5000/api/coach/${profile._id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${user.token}` }
          });
          if (res.ok) {
            setProfile(null);
            setSpecialization('');
            setExperience('');
            setBio('');
            Alert.alert('Đã xóa hồ sơ coach!');
          } else {
            const data = await res.json();
            Alert.alert('Lỗi', data.message || 'Không xóa được hồ sơ');
          }
        } catch (err) {
          Alert.alert('Lỗi', 'Không thể kết nối server');
        } finally {
          setLoading(false);
        }
      }}
    ]);
  };

  // Thêm hàm logout
  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp' }],
    });
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#26a69a" /></View>;
  }

  // Nếu chưa có profile, cho phép tạo mới
  if (!profile) {
    return (
      <ScrollView contentContainerStyle={styles.center}>
        <Text style={{ fontSize: 18, marginBottom: 12 }}>Chưa có hồ sơ coach</Text>
        <TextInput
          placeholder="Chuyên môn"
          value={specialization}
          onChangeText={setSpecialization}
          style={styles.input}
        />
        <TextInput
          placeholder="Số năm kinh nghiệm"
          value={experience}
          onChangeText={setExperience}
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          placeholder="Mô tả"
          value={bio}
          onChangeText={setBio}
          style={[styles.input, { height: 80 }]}
          multiline
        />
        <Button title="Tạo hồ sơ" onPress={handleCreateProfile} />
      </ScrollView>
    );
  }

  // Nếu đang chỉnh sửa
  if (editMode) {
    return (
      <ScrollView contentContainerStyle={stylesEdit.center} style={{ backgroundColor: '#f6f8fa' }}>
        <View style={stylesEdit.card}>
          <Text style={stylesEdit.title}>Chỉnh sửa hồ sơ coach</Text>
          <Text style={stylesEdit.label}>Chuyên môn</Text>
          <TextInput
            placeholder="Chuyên môn"
            value={specialization}
            onChangeText={setSpecialization}
            style={stylesEdit.input}
          />
          <Text style={stylesEdit.label}>Số năm kinh nghiệm</Text>
          <TextInput
            placeholder="Số năm kinh nghiệm"
            value={experience}
            onChangeText={setExperience}
            keyboardType="numeric"
            style={stylesEdit.input}
          />
          <Text style={stylesEdit.label}>Mô tả</Text>
          <TextInput
            placeholder="Mô tả"
            value={bio}
            onChangeText={setBio}
            style={[stylesEdit.input, { height: 80 }]}
            multiline
          />
          <View style={stylesEdit.btnRow}>
            <TouchableOpacity style={[stylesEdit.btn, { backgroundColor: '#bdbdbd' }]} onPress={() => setEditMode(false)}>
              <Text style={stylesEdit.btnText}>HỦY</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[stylesEdit.btn, { backgroundColor: '#26a69a' }]} onPress={handleEditProfile}>
              <Text style={stylesEdit.btnText}>LƯU</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Hiển thị profile coach
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f6f8fa' }} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={stylesNew.profileCard}>
        <View style={stylesNew.avatarWrap}>
          <Icon name="person-circle" size={110} color="#26a69a" style={stylesNew.avatar} />
        </View>
        <Text style={stylesNew.name}>{profile.coach_id?.name || user?.name}</Text>
        <Text style={stylesNew.email}>{profile.coach_id?.email || user?.email}</Text>
      </View>
      <View style={stylesNew.infoSection}>
        <View style={stylesNew.infoCard}>
          <Icon name="school-outline" size={22} color="#26a69a" style={stylesNew.infoIcon} />
          <View>
            <Text style={stylesNew.label}>Chuyên môn</Text>
            <Text style={stylesNew.value}>{profile.specialization || 'Chưa cập nhật'}</Text>
          </View>
        </View>
        <View style={stylesNew.infoCard}>
          <Icon name="briefcase-outline" size={22} color="#ff9800" style={stylesNew.infoIcon} />
          <View>
            <Text style={stylesNew.label}>Kinh nghiệm</Text>
            <Text style={stylesNew.value}>{profile.experience_years || 0} năm</Text>
          </View>
        </View>
        <View style={stylesNew.infoCard}>
          <Icon name="document-text-outline" size={22} color="#9c27b0" style={stylesNew.infoIcon} />
          <View>
            <Text style={stylesNew.label}>Mô tả</Text>
            <Text style={stylesNew.value}>{profile.bio || 'Chưa cập nhật'}</Text>
          </View>
        </View>
        <View style={stylesNew.infoCard}>
          <Icon name="star-outline" size={22} color="#fbc02d" style={stylesNew.infoIcon} />
          <View>
            <Text style={stylesNew.label}>Rating trung bình</Text>
            <Text style={stylesNew.value}>{profile.rating_avg || 0} ⭐</Text>
          </View>
        </View>
        <View style={stylesNew.infoCard}>
          <Icon name="people-outline" size={22} color="#42a5f5" style={stylesNew.infoIcon} />
          <View>
            <Text style={stylesNew.label}>Số buổi huấn luyện</Text>
            <Text style={stylesNew.value}>{profile.total_sessions || 0}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={stylesNew.editBtn} onPress={() => setEditMode(true)}>
        <Icon name="create-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
        <Text style={stylesNew.editBtnText}>Chỉnh sửa hồ sơ</Text>
      </TouchableOpacity>
      {/* Nút đăng xuất */}
      <TouchableOpacity style={stylesNew.logoutBtn} onPress={handleLogout}>
        <Icon name="log-out-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
        <Text style={stylesNew.logoutBtnText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  headerBox: { alignItems: 'center', padding: 24, backgroundColor: '#fff', borderBottomLeftRadius: 18, borderBottomRightRadius: 18, marginBottom: 16, elevation: 2 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  email: { fontSize: 16, color: '#555', marginBottom: 8 },
  infoBox: { backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 18, elevation: 2 },
  label: { fontWeight: 'bold', color: '#26a69a', marginTop: 8 },
  value: { color: '#222', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12, width: 250, backgroundColor: '#fff' }
});

// Thêm style mới cho UI đẹp
const stylesNew = StyleSheet.create({
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    margin: 16,
    paddingVertical: 28,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarWrap: {
    marginBottom: 10,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#26a69a',
  },
  avatar: {
    backgroundColor: '#e0f7fa',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 6,
    marginBottom: 2,
  },
  email: {
    fontSize: 15,
    color: '#888',
    marginBottom: 8,
  },
  infoSection: {
    marginHorizontal: 16,
    marginTop: 10,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  infoIcon: {
    marginRight: 14,
    marginTop: 2,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  value: {
    fontSize: 17,
    color: '#222',
    fontWeight: '500',
    marginBottom: 2,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#26a69a',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignSelf: 'center',
    marginTop: 24,
    shadowColor: '#26a69a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  editBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

// Thêm style cho phần chỉnh sửa
const stylesEdit = StyleSheet.create({
  center: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#f6f8fa',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    width: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'stretch',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 18,
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

// Thêm style cho nút đăng xuất
stylesNew.logoutBtn = {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#e53935',
  borderRadius: 24,
  paddingVertical: 12,
  paddingHorizontal: 32,
  alignSelf: 'center',
  marginTop: 18,
  shadowColor: '#e53935',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.12,
  shadowRadius: 6,
  elevation: 2,
};
stylesNew.logoutBtnText = {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
}; 