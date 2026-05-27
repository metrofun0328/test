import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Modal, Alert, Image, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';

const MOODS = [
  { emoji: '😄', label: '開心' },
  { emoji: '😍', label: '驚喜' },
  { emoji: '😌', label: '放鬆' },
  { emoji: '🤩', label: '興奮' },
  { emoji: '😴', label: '疲累' },
  { emoji: '🤔', label: '沉思' },
];

function DiaryForm({ visible, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [mood, setMood] = useState(null);
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要相簿權限', '請在設定中允許存取相簿');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要相機權限', '請在設定中允許使用相機');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('提醒', '請填寫標題和內容！');
      return;
    }
    onSave({ title, content, location, mood, image });
    setTitle(''); setContent(''); setLocation(''); setMood(null); setImage(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.formContainer}>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>新增旅遊日記</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formBody}>
          {/* Photo */}
          <TouchableOpacity
            style={[styles.photoArea, image && { padding: 0 }]}
            onPress={() => Alert.alert('新增照片', '', [
              { text: '拍照', onPress: takePicture },
              { text: '從相簿選擇', onPress: pickImage },
              { text: '取消', style: 'cancel' },
            ])}
          >
            {image ? (
              <>
                <Image source={{ uri: image }} style={styles.previewImage} />
                <TouchableOpacity style={styles.removePhoto} onPress={() => setImage(null)}>
                  <Ionicons name="close-circle" size={24} color="#fff" />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Ionicons name="camera" size={36} color="#ccc" />
                <Text style={styles.photoText}>點擊新增照片</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Mood */}
          <Text style={styles.label}>今天的心情</Text>
          <View style={styles.moodRow}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m.label}
                style={[styles.moodBtn, mood?.label === m.label && styles.moodBtnActive]}
                onPress={() => setMood(m)}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={[styles.moodLabel, mood?.label === m.label && { color: '#667eea' }]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>標題 *</Text>
          <TextInput style={styles.input} placeholder="這趟旅程的主題是..." value={title} onChangeText={setTitle} />

          <Text style={styles.label}>地點</Text>
          <TextInput style={styles.input} placeholder="你現在在哪裡？" value={location} onChangeText={setLocation} />

          <Text style={styles.label}>旅遊心得 *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="寫下今天的旅遊心得與回憶..."
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={8}
          />
        </ScrollView>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name="save" size={20} color="#fff" />
          <Text style={styles.saveBtnText}>儲存日記</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

function DiaryDetail({ diary, visible, onClose, onDelete }) {
  if (!diary) return null;
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
        {diary.image ? (
          <Image source={{ uri: diary.image }} style={styles.detailImage} />
        ) : (
          <View style={[styles.detailImage, { backgroundColor: '#667eea', justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="book" size={60} color="rgba(255,255,255,0.5)" />
          </View>
        )}

        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.detailContent}>
          {diary.mood && (
            <Text style={styles.detailMood}>{diary.mood.emoji} {diary.mood.label}</Text>
          )}
          <Text style={styles.detailTitle}>{diary.title}</Text>

          {diary.location ? (
            <View style={styles.detailLocation}>
              <Ionicons name="location" size={14} color="#667eea" />
              <Text style={styles.detailLocationText}>{diary.location}</Text>
            </View>
          ) : null}

          <Text style={styles.detailDate}>
            {new Date(diary.createdAt).toLocaleDateString('zh-TW', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.detailBody}>{diary.content}</Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => Alert.alert('刪除日記', '確定要刪除這篇日記嗎？', [
          { text: '取消' },
          { text: '刪除', style: 'destructive', onPress: () => { onDelete(diary.id); onClose(); } },
        ])}
      >
        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
        <Text style={styles.deleteBtnText}>刪除日記</Text>
      </TouchableOpacity>
    </Modal>
  );
}

export default function DiaryScreen() {
  const { diaries, addDiary, deleteDiary } = useApp();
  const [formVisible, setFormVisible] = useState(false);
  const [selectedDiary, setSelectedDiary] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>旅遊日記</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setFormVisible(true)}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={diaries.slice().reverse()}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 15 }}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={80} color="#ddd" />
            <Text style={styles.emptyTitle}>還沒有旅遊日記</Text>
            <Text style={styles.emptySubtitle}>記錄你的旅遊回憶和心情！</Text>
            <TouchableOpacity style={styles.createBtn} onPress={() => setFormVisible(true)}>
              <Text style={styles.createBtnText}>寫下第一篇日記</Text>
            </TouchableOpacity>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.diaryCard}
            onPress={() => { setSelectedDiary(item); setDetailVisible(true); }}
          >
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.cardThumbnail} />
            ) : (
              <View style={[styles.cardThumbnail, { backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="book" size={30} color="#667eea" />
              </View>
            )}
            <View style={styles.cardContent}>
              <View style={styles.cardTopRow}>
                {item.mood && <Text style={styles.cardMoodEmoji}>{item.mood.emoji}</Text>}
                <Text style={styles.cardDate}>
                  {new Date(item.createdAt).toLocaleDateString('zh-TW')}
                </Text>
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              {item.location ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                  <Ionicons name="location-outline" size={11} color="#999" />
                  <Text style={styles.cardLocation}> {item.location}</Text>
                </View>
              ) : null}
              <Text style={styles.cardPreview} numberOfLines={2}>{item.content}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <DiaryForm visible={formVisible} onClose={() => setFormVisible(false)} onSave={addDiary} />
      <DiaryDetail
        diary={selectedDiary}
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        onDelete={deleteDiary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    backgroundColor: '#45B7D1', paddingTop: 55, paddingBottom: 15,
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
  emptySubtitle: { fontSize: 14, color: '#ccc', marginTop: 8 },
  createBtn: { backgroundColor: '#45B7D1', borderRadius: 25, paddingHorizontal: 30, paddingVertical: 12, marginTop: 25 },
  createBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  diaryCard: {
    backgroundColor: '#fff', borderRadius: 15,
    flexDirection: 'row', marginBottom: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardThumbnail: { width: 100, height: 110 },
  cardContent: { flex: 1, padding: 12 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardMoodEmoji: { fontSize: 16 },
  cardDate: { fontSize: 11, color: '#999' },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  cardLocation: { fontSize: 11, color: '#999' },
  cardPreview: { fontSize: 12, color: '#666', lineHeight: 17 },
  // Form styles
  formContainer: { flex: 1, backgroundColor: '#fff' },
  formHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  formTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  formBody: { flex: 1, padding: 20 },
  photoArea: {
    height: 160, backgroundColor: '#f8f9fa', borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#eee', borderStyle: 'dashed',
    overflow: 'hidden', marginBottom: 15,
  },
  photoText: { color: '#ccc', marginTop: 8 },
  previewImage: { width: '100%', height: '100%' },
  removePhoto: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12,
  },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  moodBtn: {
    alignItems: 'center', padding: 10, borderRadius: 10,
    backgroundColor: '#f8f9fa', flex: 1, marginHorizontal: 2,
  },
  moodBtnActive: { backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#667eea' },
  moodEmoji: { fontSize: 22 },
  moodLabel: { fontSize: 10, color: '#999', marginTop: 3 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8, marginTop: 10 },
  input: {
    backgroundColor: '#f8f9fa', borderRadius: 10, padding: 12,
    fontSize: 15, color: '#333', borderWidth: 1, borderColor: '#eee',
  },
  textArea: { height: 160, textAlignVertical: 'top' },
  saveBtn: {
    backgroundColor: '#45B7D1', margin: 20, borderRadius: 12,
    paddingVertical: 15, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  // Detail styles
  detailImage: { width: '100%', height: 280 },
  closeBtn: {
    position: 'absolute', top: 50, left: 15,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  detailContent: { padding: 20 },
  detailMood: { fontSize: 16, color: '#667eea', marginBottom: 8 },
  detailTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  detailLocation: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  detailLocationText: { fontSize: 14, color: '#667eea', marginLeft: 4 },
  detailDate: { fontSize: 13, color: '#999', marginBottom: 15 },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginBottom: 15 },
  detailBody: { fontSize: 16, color: '#444', lineHeight: 26 },
  deleteBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  deleteBtnText: { color: '#FF6B6B', marginLeft: 8, fontWeight: '600' },
});
