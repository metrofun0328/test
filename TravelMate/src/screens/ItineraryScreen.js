import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Modal, Alert, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

function TripForm({ visible, onClose, onSave }) {
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!name.trim() || !destination.trim() || !startDate.trim() || !endDate.trim()) {
      Alert.alert('提醒', '請填寫行程名稱、目的地和日期！');
      return;
    }
    onSave({ name, destination, startDate, endDate, notes, status: 'active', activities: [] });
    setName(''); setDestination(''); setStartDate(''); setEndDate(''); setNotes('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.formContainer}>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>新增行程</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formBody}>
          <Text style={styles.label}>行程名稱 *</Text>
          <TextInput style={styles.input} placeholder="例：日本東京五日遊" value={name} onChangeText={setName} />

          <Text style={styles.label}>目的地 *</Text>
          <TextInput style={styles.input} placeholder="例：日本東京" value={destination} onChangeText={setDestination} />

          <Text style={styles.label}>出發日期 *</Text>
          <TextInput style={styles.input} placeholder="例：2024/12/20" value={startDate} onChangeText={setStartDate} />

          <Text style={styles.label}>回程日期 *</Text>
          <TextInput style={styles.input} placeholder="例：2024/12/25" value={endDate} onChangeText={setEndDate} />

          <Text style={styles.label}>備注</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="行程備注、注意事項..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
        </ScrollView>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>建立行程</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

function ActivityForm({ visible, onClose, onSave }) {
  const [time, setTime] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('提醒', '請填寫活動名稱！');
      return;
    }
    onSave({ time, title, location, note, id: Date.now().toString() });
    setTime(''); setTitle(''); setLocation(''); setNote('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.formContainer}>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>新增活動</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formBody}>
          <Text style={styles.label}>時間</Text>
          <TextInput style={styles.input} placeholder="例：09:00" value={time} onChangeText={setTime} />

          <Text style={styles.label}>活動名稱 *</Text>
          <TextInput style={styles.input} placeholder="例：參觀淺草寺" value={title} onChangeText={setTitle} />

          <Text style={styles.label}>地點</Text>
          <TextInput style={styles.input} placeholder="例：東京都台東區" value={location} onChangeText={setLocation} />

          <Text style={styles.label}>備注</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="活動說明..."
            value={note}
            onChangeText={setNote}
            multiline
          />
        </ScrollView>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>新增活動</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

function TripDetail({ trip, visible, onClose, onUpdate, onDelete }) {
  const [activityFormVisible, setActivityFormVisible] = useState(false);

  if (!trip) return null;

  const addActivity = (activity) => {
    const activities = [...(trip.activities || []), activity];
    onUpdate(trip.id, { activities });
  };

  const removeActivity = (actId) => {
    const activities = (trip.activities || []).filter((a) => a.id !== actId);
    onUpdate(trip.id, { activities });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        {/* Header */}
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.detailTitle} numberOfLines={1}>{trip.name}</Text>
          <TouchableOpacity onPress={() => Alert.alert('刪除行程', '確定要刪除這個行程嗎？', [
            { text: '取消' },
            { text: '刪除', style: 'destructive', onPress: () => { onDelete(trip.id); onClose(); } },
          ])}>
            <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }}>
          {/* Trip Info Card */}
          <View style={styles.tripInfoCard}>
            <View style={styles.tripInfoRow}>
              <Ionicons name="location" size={16} color="#667eea" />
              <Text style={styles.tripInfoText}>{trip.destination}</Text>
            </View>
            <View style={styles.tripInfoRow}>
              <Ionicons name="calendar" size={16} color="#4ECDC4" />
              <Text style={styles.tripInfoText}>{trip.startDate} → {trip.endDate}</Text>
            </View>
            {trip.notes ? (
              <View style={styles.tripInfoRow}>
                <Ionicons name="document-text" size={16} color="#96CEB4" />
                <Text style={styles.tripInfoText}>{trip.notes}</Text>
              </View>
            ) : null}
          </View>

          {/* Activities */}
          <View style={styles.activitiesSection}>
            <View style={styles.actHeaderRow}>
              <Text style={styles.actSectionTitle}>行程活動</Text>
              <TouchableOpacity
                style={styles.addActBtn}
                onPress={() => setActivityFormVisible(true)}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addActText}>新增活動</Text>
              </TouchableOpacity>
            </View>

            {(trip.activities || []).length === 0 ? (
              <View style={styles.emptyActivities}>
                <Ionicons name="calendar-outline" size={40} color="#ccc" />
                <Text style={styles.emptyActText}>還沒有活動，點擊新增！</Text>
              </View>
            ) : (
              (trip.activities || []).map((act, idx) => (
                <View key={act.id} style={styles.activityItem}>
                  <View style={styles.actTimeline}>
                    <View style={styles.actDot} />
                    {idx < (trip.activities || []).length - 1 && <View style={styles.actLine} />}
                  </View>
                  <View style={styles.actContent}>
                    {act.time ? <Text style={styles.actTime}>{act.time}</Text> : null}
                    <Text style={styles.actTitle}>{act.title}</Text>
                    {act.location ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="location-outline" size={12} color="#999" />
                        <Text style={styles.actLocation}>{act.location}</Text>
                      </View>
                    ) : null}
                    {act.note ? <Text style={styles.actNote}>{act.note}</Text> : null}
                    <TouchableOpacity style={styles.actDeleteBtn} onPress={() => removeActivity(act.id)}>
                      <Ionicons name="close" size={16} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <ActivityForm
          visible={activityFormVisible}
          onClose={() => setActivityFormVisible(false)}
          onSave={addActivity}
        />
      </View>
    </Modal>
  );
}

export default function ItineraryScreen() {
  const { trips, addTrip, updateTrip, deleteTrip } = useApp();
  const [formVisible, setFormVisible] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>我的行程</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setFormVisible(true)}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 15 }}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="map-outline" size={80} color="#ddd" />
            <Text style={styles.emptyTitle}>還沒有行程計畫</Text>
            <Text style={styles.emptySubtitle}>點擊右上角的 + 開始規劃你的旅程！</Text>
            <TouchableOpacity style={styles.createBtn} onPress={() => setFormVisible(true)}>
              <Text style={styles.createBtnText}>建立第一個行程</Text>
            </TouchableOpacity>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.tripCard}
            onPress={() => { setSelectedTrip(item); setDetailVisible(true); }}
          >
            <View style={styles.tripCardLeft}>
              <View style={styles.tripCardIcon}>
                <Ionicons name="airplane" size={24} color="#667eea" />
              </View>
            </View>
            <View style={styles.tripCardContent}>
              <Text style={styles.tripCardName}>{item.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="location-outline" size={13} color="#999" />
                <Text style={styles.tripCardDest}> {item.destination}</Text>
              </View>
              <Text style={styles.tripCardDate}>{item.startDate} → {item.endDate}</Text>
              <Text style={styles.tripCardActs}>
                {(item.activities || []).length} 個活動
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        )}
      />

      <TripForm visible={formVisible} onClose={() => setFormVisible(false)} onSave={addTrip} />

      <TripDetail
        trip={selectedTrip}
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        onUpdate={(id, updates) => {
          updateTrip(id, updates);
          setSelectedTrip((prev) => ({ ...prev, ...updates }));
        }}
        onDelete={deleteTrip}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    backgroundColor: '#667eea', paddingTop: 55, paddingBottom: 15,
    paddingHorizontal: 20, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  addBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center', alignItems: 'center',
  },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#999', marginTop: 20 },
  emptySubtitle: { fontSize: 14, color: '#ccc', marginTop: 8, textAlign: 'center' },
  createBtn: { backgroundColor: '#667eea', borderRadius: 25, paddingHorizontal: 30, paddingVertical: 12, marginTop: 25 },
  createBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  tripCard: {
    backgroundColor: '#fff', borderRadius: 15, padding: 15,
    flexDirection: 'row', alignItems: 'center', marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  tripCardLeft: { marginRight: 15 },
  tripCardIcon: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center',
  },
  tripCardContent: { flex: 1 },
  tripCardName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  tripCardDest: { fontSize: 13, color: '#999' },
  tripCardDate: { fontSize: 12, color: '#667eea', marginTop: 3 },
  tripCardActs: { fontSize: 11, color: '#aaa', marginTop: 3 },
  // Form styles
  formContainer: { flex: 1, backgroundColor: '#fff' },
  formHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  formTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  formBody: { flex: 1, padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8, marginTop: 10 },
  input: {
    backgroundColor: '#f8f9fa', borderRadius: 10, padding: 12,
    fontSize: 15, color: '#333', borderWidth: 1, borderColor: '#eee',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  saveBtn: {
    backgroundColor: '#667eea', margin: 20, borderRadius: 12,
    paddingVertical: 15, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  // Detail styles
  detailHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 55, paddingBottom: 15, paddingHorizontal: 20,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  detailTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1, textAlign: 'center' },
  tripInfoCard: {
    backgroundColor: '#fff', margin: 15, borderRadius: 15, padding: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  tripInfoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  tripInfoText: { fontSize: 14, color: '#444', marginLeft: 8, flex: 1 },
  activitiesSection: { paddingHorizontal: 15, paddingBottom: 30 },
  actHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  actSectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  addActBtn: {
    backgroundColor: '#667eea', borderRadius: 20, paddingHorizontal: 15,
    paddingVertical: 7, flexDirection: 'row', alignItems: 'center',
  },
  addActText: { color: '#fff', fontWeight: '600', fontSize: 13, marginLeft: 4 },
  emptyActivities: { alignItems: 'center', paddingVertical: 40 },
  emptyActText: { color: '#ccc', marginTop: 10 },
  activityItem: { flexDirection: 'row', marginBottom: 10 },
  actTimeline: { alignItems: 'center', marginRight: 12, width: 20 },
  actDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#667eea', marginTop: 4 },
  actLine: { width: 2, flex: 1, backgroundColor: '#E0E0E0', marginTop: 4 },
  actContent: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
    position: 'relative',
  },
  actTime: { fontSize: 12, color: '#667eea', fontWeight: '600', marginBottom: 2 },
  actTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  actLocation: { fontSize: 12, color: '#999', marginLeft: 3 },
  actNote: { fontSize: 13, color: '#666', marginTop: 5 },
  actDeleteBtn: { position: 'absolute', top: 10, right: 10 },
});
