import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HealthImprovements = ({ improvements }) => {
  if (!improvements || improvements.length === 0) {
    return (
      <View style={styles.healthCard}>
        <Text style={styles.cardTitle}>💊 Cải thiện sức khỏe</Text>
        <Text style={styles.noImprovementsText}>
          Hãy kiên trì! Những cải thiện sức khỏe sẽ xuất hiện sớm thôi.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.healthCard}>
      <Text style={styles.cardTitle}>💊 Cải thiện sức khỏe</Text>
      {improvements.map((improvement, index) => (
        <View key={index} style={styles.healthItem}>
          <View style={styles.healthHeader}>
            <Text style={styles.healthTitle}>{improvement.title}</Text>
            {improvement.timeline && (
              <Text style={styles.healthTimeline}>{improvement.timeline}</Text>
            )}
          </View>
          <Text style={styles.healthDescription}>{improvement.description}</Text>
          {improvement.benefits && (
            <View style={styles.benefitsList}>
              {improvement.benefits.map((benefit, idx) => (
                <Text key={idx} style={styles.benefitItem}>
                  • {benefit}
                </Text>
              ))}
            </View>
          )}
          {improvement.achieved && (
            <View style={styles.achievedBadge}>
              <Text style={styles.achievedText}>✓ Đã đạt được</Text>
            </View>
          )}
        </View>
      ))}
      
      <View style={styles.encouragementCard}>
        <Text style={styles.encouragementTitle}>🌟 Động lực</Text>
        <Text style={styles.encouragementText}>
          Mỗi ngày không hút thuốc, cơ thể bạn đang hồi phục và trở nên khỏe mạnh hơn. 
          Hãy tiếp tục và cảm nhận những thay đổi tích cực!
        </Text>
      </View>
    </View>
  );
};

export default HealthImprovements;

const styles = StyleSheet.create({
  healthCard: {
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
  noImprovementsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6c757d',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  healthItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    position: 'relative',
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28a745',
    flex: 1,
  },
  healthTimeline: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: '500',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  healthDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 8,
  },
  benefitsList: {
    marginTop: 8,
  },
  benefitItem: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 18,
    marginBottom: 4,
  },
  achievedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#28a745',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  achievedText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  encouragementCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  encouragementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 8,
  },
  encouragementText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});