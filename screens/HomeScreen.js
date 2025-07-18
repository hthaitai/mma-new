import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚭 Chào mừng bạn đến với ứng dụng Cai Thuốc Lá!</Text>
      <Text style={styles.subtitle}>
        Hãy bắt đầu hành trình thay đổi cuộc sống của bạn.
      </Text>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Tổng quan nhanh</Text>
        <Text style={styles.info}>• Theo dõi tiến trình cai thuốc mỗi ngày</Text>
        <Text style={styles.info}>• Xem thành tựu và cải thiện sức khỏe</Text>
        <Text style={styles.info}>• Hoàn thành các nhiệm vụ để duy trì động lực</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Động lực hôm nay</Text>
        <Text style={styles.motivation}>
          "Mỗi ngày không hút thuốc là một ngày bạn đang chiến thắng chính mình!"
        </Text>
      </View>
   
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 8,
  },
  info: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  motivation: {
    fontSize: 16,
    color: '#28a745',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  quickActions: {
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginTop: 8,
  },
  action: {
    fontSize: 15,
    color: '#007bff',
    marginBottom: 6,
  },
});
