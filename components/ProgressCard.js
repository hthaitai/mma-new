import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProgressCard = ({ currentStage, progressStats }) => {
  if (!progressStats) return null;

  return (
    <View style={styles.progressCard}>
      <Text style={styles.cardTitle}>📈 Tiến độ hiện tại</Text>
      
      {currentStage && (
        <Text style={styles.stageName}>🎯 {currentStage.title}</Text>
      )}
      
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${progressStats.completion_percentage || 0}%` }
          ]} 
        />
      </View>
      
      <Text style={styles.progressText}>
        {progressStats.completion_percentage || 0}% hoàn thành
      </Text>
      
      <View style={styles.statsRow}>
        <Text style={styles.daysCount}>
          Ngày {progressStats.days_since_start || 0} / {progressStats.total_days || 0}
        </Text>
        <Text style={styles.stagesCount}>
          Giai đoạn {progressStats.completed_stages || 0} / {progressStats.total_stages || 0}
        </Text>
      </View>
    </View>
  );
};

export default ProgressCard;

const styles = StyleSheet.create({
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  stageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007bff',
    textAlign: 'center',
    marginBottom: 16,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 6,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#28a745',
    borderRadius: 6,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  daysCount: {
    fontSize: 14,
    color: '#6c757d',
  },
  stagesCount: {
    fontSize: 14,
    color: '#6c757d',
  },
});