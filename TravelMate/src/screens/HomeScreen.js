import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const QUICK_ACTIONS = [
  { icon: 'search', label: '探索景點', screen: 'Explore', color: '#FF6B6B' },
  { icon: 'calendar', label: '行程規劃', screen: 'Itinerary', color: '#4ECDC4' },
  { icon: 'book', label: '旅遊日記', screen: 'Diary', color: '#45B7D1' },
  { icon: 'wallet', label: '記帳分帳', screen: 'Expense', color: '#96CEB4' },
];

export default function HomeScreen({ navigation }) {
  const { trips, diaries, expenses } = useApp();

  const totalExpense = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const activeTrips = trips.filter((t) => t.status === 'active').length;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>你好，旅行者！</Text>
          <Text style={styles.subGreeting}>準備好下一段旅程了嗎？</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{trips.length}</Text>
          <Text style={styles.statLabel}>行程計畫</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{diaries.length}</Text>
          <Text style={styles.statLabel}>旅遊日記</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>NT${totalExpense.toFixed(0)}</Text>
          <Text style={styles.statLabel}>總花費</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>快速功能</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.screen}
              style={[styles.actionCard, { backgroundColor: action.color }]}
              onPress={() => navigation.navigate(action.screen)}
            >
              <Ionicons name={action.icon} size={32} color="#fff" />
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Trips */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>近期行程</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Itinerary')}>
            <Text style={styles.seeAll}>查看全部</Text>
          </TouchableOpacity>
        </View>
        {trips.length === 0 ? (
          <TouchableOpacity
            style={styles.emptyCard}
            onPress={() => navigation.navigate('Itinerary')}
          >
            <Ionicons name="add-circle-outline" size={48} color="#4ECDC4" />
            <Text style={styles.emptyText}>建立你的第一個行程！</Text>
          </TouchableOpacity>
        ) : (
          trips.slice(-2).reverse().map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={styles.tripCard}
              onPress={() => navigation.navigate('Itinerary')}
            >
              <View style={styles.tripInfo}>
                <Text style={styles.tripName}>{trip.name}</Text>
                <Text style={styles.tripDate}>
                  {trip.startDate} → {trip.endDate}
                </Text>
                <Text style={styles.tripDest}>{trip.destination}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Recent Diaries */}
      <View style={[styles.section, { marginBottom: 30 }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>最新日記</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Diary')}>
            <Text style={styles.seeAll}>查看全部</Text>
          </TouchableOpacity>
        </View>
        {diaries.length === 0 ? (
          <TouchableOpacity
            style={styles.emptyCard}
            onPress={() => navigation.navigate('Diary')}
          >
            <Ionicons name="pencil-outline" size={48} color="#45B7D1" />
            <Text style={styles.emptyText}>記錄你的旅遊回憶！</Text>
          </TouchableOpacity>
        ) : (
          diaries.slice(-2).reverse().map((diary) => (
            <View key={diary.id} style={styles.diaryCard}>
              <Text style={styles.diaryTitle}>{diary.title}</Text>
              <Text style={styles.diaryContent} numberOfLines={2}>{diary.content}</Text>
              <Text style={styles.diaryDate}>{new Date(diary.createdAt).toLocaleDateString('zh-TW')}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    backgroundColor: '#667eea',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subGreeting: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  notificationBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: '#fff', marginHorizontal: 20,
    marginTop: -15, borderRadius: 15,
    paddingVertical: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 5,
  },
  statCard: { alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 12, color: '#999', marginTop: 2 },
  section: { paddingHorizontal: 20, marginTop: 25 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  seeAll: { fontSize: 14, color: '#667eea' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: {
    width: (width - 50) / 2, height: 100,
    borderRadius: 15, justifyContent: 'center',
    alignItems: 'center', marginBottom: 10,
  },
  actionLabel: { color: '#fff', fontWeight: '600', marginTop: 8, fontSize: 14 },
  emptyCard: {
    backgroundColor: '#fff', borderRadius: 15,
    padding: 30, alignItems: 'center',
    borderWidth: 2, borderColor: '#eee', borderStyle: 'dashed',
  },
  emptyText: { color: '#999', marginTop: 10, fontSize: 14 },
  tripCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 15,
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  tripInfo: { flex: 1 },
  tripName: { fontSize: 16, fontWeight: '600', color: '#333' },
  tripDate: { fontSize: 12, color: '#999', marginTop: 3 },
  tripDest: { fontSize: 13, color: '#667eea', marginTop: 2 },
  diaryCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 15,
    marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  diaryTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  diaryContent: { fontSize: 13, color: '#666', marginTop: 5, lineHeight: 20 },
  diaryDate: { fontSize: 11, color: '#999', marginTop: 8 },
});
