import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CoachChatScreen() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [error, setError] = useState(null);
  const userRef = useRef(null);

  useEffect(() => {
    (async () => {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) return;
      const user = JSON.parse(userData);
      userRef.current = user;
      await fetchSessions(user.id, user.token);
    })();
  }, []);

  const fetchSessions = async (userId, token) => {
    try {
      setSessionLoading(true);
      setError(null);
      const res = await fetch(`http://192.168.243.1:5000/api/chat/sessions/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!Array.isArray(data)) {
        setError('Không lấy được danh sách phiên chat!');
        setSessions([]);
        setLoading(false);
        return;
      }
      setSessions(data);
      if (data.length) {
        setChatId(data[0]._id);
        fetchChatHistory(data[0]._id, token);
      } else {
        await handleCreateNewSession(userId, token);
      }
    } catch (err) {
      setError('Lỗi khi lấy phiên chat: ' + err.message);
      setSessions([]);
      setLoading(false);
    } finally {
      setSessionLoading(false);
    }
  };

  const handleCreateNewSession = async (userId, token) => {
    try {
      const res = await fetch(`http://192.168.243.1:5000/api/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });
      const session = await res.json();
      if (session && session._id) {
        setSessions(prev => [session, ...prev]);
        setChatId(session._id);
        fetchChatHistory(session._id, token);
      } else {
        setError('Không tạo được phiên chat mới!');
        setLoading(false);
      }
    } catch (err) {
      setError('Lỗi khi tạo phiên chat mới: ' + err.message);
      setLoading(false);
    }
  };

  const handleSelectSession = (session) => {
    setChatId(session._id);
    fetchChatHistory(session._id, userRef.current.token);
  };

  const fetchChatHistory = async (chatId, token) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`http://192.168.243.1:5000/api/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(data);
      } else {
        setMessages([]);
        setError('Không lấy được lịch sử chat!');
      }
    } catch (err) {
      setMessages([]);
      setError('Lỗi khi lấy lịch sử chat: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !chatId) {
      Alert.alert('Lỗi', 'Không có phiên chat hợp lệ!');
      return;
    }
    setSending(true);
    const user = userRef.current;
    try {
      const res = await fetch(`http://192.168.243.1:5000/api/chat/${chatId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ content: input, userId: user.id })
      });
      const data = await res.json();
      if (res.ok && data.userMessage && data.aiMessage) {
        setMessages(prev => [
          ...prev,
          data.userMessage,
          data.aiMessage
        ]);
        setInput('');
      } else {
        Alert.alert('Lỗi', data.message || 'Không gửi được tin nhắn');
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể kết nối server');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    if (error) {
      return (
        <View style={styles.center}>
          <Text style={{ color: 'red', fontSize: 16, marginBottom: 12 }}>{error}</Text>
          <TouchableOpacity style={{ backgroundColor: '#26a69a', padding: 12, borderRadius: 18 }} onPress={() => {
            setError(null);
            setLoading(true);
            const user = userRef.current;
            if (user) fetchSessions(user.id, user.token);
          }}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return <View style={styles.center}><ActivityIndicator size="large" color="#26a69a" /></View>;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Danh sách session */}
      <View style={{ backgroundColor: '#f5f5f5', padding: 8 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Các phiên chat:</Text>
        {sessionLoading ? <ActivityIndicator /> : (
          <FlatList
            data={sessions}
            horizontal
            keyExtractor={(item, idx) => item._id ? item._id.toString() : idx.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  backgroundColor: item._id === chatId ? '#26a69a' : '#fff',
                  padding: 8,
                  borderRadius: 8,
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: '#26a69a'
                }}
                onPress={() => handleSelectSession(item)}
              >
                <Text style={{ color: item._id === chatId ? '#fff' : '#26a69a' }}>
                  {item.title || 'Chat mới'}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
        <TouchableOpacity
          style={{ marginTop: 8, alignSelf: 'flex-start', backgroundColor: '#26a69a', padding: 8, borderRadius: 8 }}
          onPress={() => handleCreateNewSession(userRef.current.id, userRef.current.token)}
        >
          <Text style={{ color: '#fff' }}>+ Tạo chat mới</Text>
        </TouchableOpacity>
      </View>
      {/* Khung chat */}
      <View style={styles.headerBox}>
        <Icon name="chatbubbles" size={28} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.header}>Tư vấn viên AI</Text>
      </View>
      <View style={styles.chatContainer}>
        <FlatList
          data={[...messages].reverse()}
          renderItem={({ item }) => (
            <View style={item.sender_type === 'user' ? styles.userMsgBox : styles.coachMsgBox}>
              <Text style={styles.sender}>{item.sender_type === 'user' ? 'Bạn' : 'AI'}:</Text>
              <Text style={item.sender_type === 'user' ? styles.userMsg : styles.coachMsg}>{item.content}</Text>
            </View>
          )}
          keyExtractor={item => item._id}
          style={styles.chatBox}
          contentContainerStyle={{ paddingVertical: 8 }}
          inverted
        />
      </View>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Nhập tin nhắn"
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={sending}>
          {sending
            ? <ActivityIndicator size={22} color="#fff" />
            : <Icon name="send" size={22} color="#fff" />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#26a69a',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  header: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  chatContainer: { flex: 1, backgroundColor: '#f9f9f9', paddingHorizontal: 8, paddingTop: 8 },
  chatBox: { flex: 1 },
  userMsgBox: {
    alignSelf: 'flex-end',
    backgroundColor: '#e0f7fa',
    borderRadius: 16,
    marginVertical: 4,
    padding: 10,
    maxWidth: '80%',
    shadowColor: '#26a69a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  coachMsgBox: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff3e0',
    borderRadius: 16,
    marginVertical: 4,
    padding: 10,
    maxWidth: '80%',
    shadowColor: '#ff9800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  sender: { fontSize: 12, color: '#888', marginBottom: 2 },
  userMsg: { color: '#222', fontSize: 16 },
  coachMsg: { color: '#222', fontSize: 16 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#b2dfdb',
    borderRadius: 24,
    padding: 10,
    fontSize: 16,
    marginRight: 8,
    backgroundColor: '#f5f5f5',
    color: '#222',
  },
  sendBtn: {
    backgroundColor: '#26a69a',
    borderRadius: 24,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
}); 