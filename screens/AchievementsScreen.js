import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllBadgesWithUserStatus, shareUserBadge } from '../services/badgeService';

const getUserId = async () => {
  const userStr = await AsyncStorage.getItem('user');
  if (!userStr) return null;
  const user = JSON.parse(userStr);
  return user._id || user.id;
};

const AchievementsScreen = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBadges: 0,
    earnedBadges: 0,
    totalPoints: 0
  });

  const fetchBadges = async () => {
    try {
      const userId = await getUserId();
      if (!userId) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin user');
        return;
      }

      const badgesData = await getAllBadgesWithUserStatus(userId);
      setBadges(badgesData);

      // Tính toán thống kê
      const earnedCount = badgesData.filter(b => b.earned).length;
      const totalPoints = badgesData
        .filter(b => b.earned)
        .reduce((sum, b) => sum + (b.point_value || 0), 0);

      setStats({
        totalBadges: badgesData.length,
        earnedBadges: earnedCount,
        totalPoints: totalPoints
      });
    } catch (error) {
      console.error('Error fetching badges:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách huy hiệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const handleShareBadge = async (badge) => {
    if (!badge.earned) {
      Alert.alert('Thông báo', 'Bạn cần đạt được huy hiệu này trước khi chia sẻ!');
      return;
    }

    try {
      await shareUserBadge(
        badge._id,
        `Tôi vừa đạt được huy hiệu "${badge.name}"! 🎉`,
        `Chia sẻ huy hiệu: ${badge.name}`,
        ['achievement', 'badge', 'smoking-cessation']
      );
      Alert.alert('Thành công', 'Đã chia sẻ huy hiệu lên cộng đồng!');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chia sẻ huy hiệu');
    }
  };

  const getTierColor = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'bronze': return '#cd7f32';
      case 'silver': return '#c0c0c0';
      case 'gold': return '#ffd700';
      case 'platinum': return '#e5e4e2';
      default: return '#2196f3';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Đang tải huy hiệu...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Thống kê tổng quan */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Thống kê huy hiệu</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.earnedBadges}</Text>
            <Text style={styles.statLabel}>Đã đạt</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalBadges}</Text>
            <Text style={styles.statLabel}>Tổng cộng</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalPoints}</Text>
            <Text style={styles.statLabel}>Điểm</Text>
          </View>
        </View>
      </View>

      {/* Danh sách huy hiệu */}
      <View style={styles.badgesCard}>
        <Text style={styles.sectionTitle}>Danh sách huy hiệu</Text>
        {badges.length === 0 ? (
          <Text style={styles.emptyText}>Chưa có huy hiệu nào</Text>
        ) : (
          badges.map((badge, index) => (
            <View key={badge._id} style={[
              styles.badgeItem,
              { opacity: badge.earned ? 1 : 0.5 }
            ]}>
              <View style={styles.badgeHeader}>
                <View style={styles.badgeInfo}>
                  <Text style={[
                    styles.badgeName,
                    { color: getTierColor(badge.tier) }
                  ]}>
                    {badge.name}
                  </Text>
                  <Text style={styles.badgeTier}>
                    {badge.tier?.toUpperCase() || 'BASIC'}
                  </Text>
                  <Text style={styles.badgePoints}>
                    {badge.point_value || 0} điểm
                  </Text>
                </View>
                {badge.url_image && (
                  <Image
                    source={{ uri: badge.url_image }}
                    style={styles.badgeImage}
                    resizeMode="contain"
                  />
                )}
              </View>
              
              <Text style={styles.badgeCondition}>
                Điều kiện: {badge.condition}
              </Text>
              
              <View style={styles.badgeStatus}>
                <Text style={[
                  styles.statusText,
                  { color: badge.earned ? '#4caf50' : '#ff9800' }
                ]}>
                  {badge.earned ? '✅ Đã đạt được' : '⏳ Chưa đạt'}
                </Text>
                
                {badge.earned && (
                  <TouchableOpacity
                    style={styles.shareButton}
                    onPress={() => handleShareBadge(badge)}
                  >
                    <Text style={styles.shareButtonText}>Chia sẻ</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    paddingTop: 50,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    margin: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196f3',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  badgesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    margin: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196f3',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
  },
  badgeItem: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  badgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  badgeTier: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 2,
  },
  badgePoints: {
    fontSize: 12,
    color: '#888',
  },
  badgeImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  badgeCondition: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  badgeStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  shareButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default AchievementsScreen; 