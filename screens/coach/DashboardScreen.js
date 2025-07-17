import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/Ionicons';

const months = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

const screenWidth = Dimensions.get('window').width;

// Dữ liệu tổng quan mẫu
const stats = {
  noSmoke: 14,
  saved: 140000,
  badges: 4,
  users: 156,
};

const pieColors = ['#26a69a', '#ff9800', '#9c27b0', '#42a5f5'];

export default function DashboardScreen() {
  const pieData = [
    {
      name: 'Không hút',
      value: stats.noSmoke,
      color: pieColors[0],
      legendFontColor: '#222',
      legendFontSize: 15,
    },
    {
      name: 'Tiết kiệm',
      value: Math.round(stats.saved / 10000),
      color: pieColors[1],
      legendFontColor: '#222',
      legendFontSize: 15,
    },
    {
      name: 'Huy hiệu',
      value: stats.badges,
      color: pieColors[2],
      legendFontColor: '#222',
      legendFontSize: 15,
    },
    {
      name: 'Người đang cai',
      value: stats.users,
      color: pieColors[3],
      legendFontColor: '#222',
      legendFontSize: 15,
    },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9f9f9' }} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.container}>
        <View style={styles.headerBox}>
          <Text style={styles.header}>Thống kê tổng quát</Text>
        </View>
        <View style={styles.grid}>
          {/* Không hút thuốc */}
          <View style={[styles.card, { backgroundColor: '#e0f7fa' }]}>  
            <Icon name="checkmark-circle" size={32} color="#26a69a" style={styles.icon} />
            <Text style={styles.label}>Không hút</Text>
            <Text style={styles.value}>{stats.noSmoke} ngày</Text>
          </View>
          {/* Tiết kiệm */}
          <View style={[styles.card, { backgroundColor: '#fff3e0' }]}>  
            <Icon name="cash-outline" size={32} color="#ff9800" style={styles.icon} />
            <Text style={styles.label}>Tiết kiệm</Text>
            <Text style={styles.value}>{stats.saved.toLocaleString()} đ</Text>
          </View>
          {/* Huy hiệu */}
          <View style={[styles.card, { backgroundColor: '#fce4ec' }]}>  
            <Icon name="ribbon-outline" size={32} color="#9c27b0" style={styles.icon} />
            <Text style={styles.label}>Huy hiệu</Text>
            <Text style={styles.value}>{stats.badges} cái</Text>
          </View>
          {/* Người đang cai */}
          <View style={[styles.card, { backgroundColor: '#e8f5e9' }]}>  
            <Icon name="people-outline" size={32} color="#42a5f5" style={styles.icon} />
            <Text style={styles.label}>Người đang cai</Text>
            <Text style={styles.value}>{stats.users} người</Text>
          </View>
        </View>
        <View style={styles.pieBox}>
          <PieChart
            data={pieData.map(item => ({
              name: item.name,
              population: item.value,
              color: item.color,
              legendFontColor: item.legendFontColor,
              legendFontSize: item.legendFontSize,
            }))}
            width={screenWidth - 32}
            height={250}
            chartConfig={{
              color: (opacity = 1) => `rgba(38, 166, 154, ${opacity})`,
            }}
            accessor={'population'}
            backgroundColor={'transparent'}
            paddingLeft={'90'}
            absolute
            hasLegend={false}
            style={{ alignSelf: 'center' }}
          />
          <View style={styles.legendRow}>
            {pieData.map((item, idx) => (
              <View style={styles.legendItem} key={item.name}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendLabel}>{item.name} ({item.value})</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const cardWidth = (Dimensions.get('window').width - 48) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  headerBox: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  header: { fontSize: 20, fontWeight: 'bold', color: '#222', marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 18 },
  card: { width: cardWidth, borderRadius: 16, padding: 18, marginBottom: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 4 },
  label: { fontSize: 16, color: '#555', marginBottom: 4 },
  value: { fontSize: 24, fontWeight: 'bold', color: '#222', marginBottom: 6 },
  pieBox: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2, alignItems: 'center' },
  legendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 8, marginBottom: 4 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 4 },
  legendLabel: { fontSize: 13, color: '#222' },
  icon: { marginBottom: 6 },
}); 