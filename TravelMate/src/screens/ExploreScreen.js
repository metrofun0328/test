import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Image, Dimensions, Modal, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ATTRACTIONS, CATEGORIES } from '../data/attractions';

const { width } = Dimensions.get('window');

function StarRating({ rating }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= Math.floor(rating) ? 'star' : i - 0.5 <= rating ? 'star-half' : 'star-outline'}
          size={14}
          color="#FFD700"
        />
      ))}
      <Text style={{ marginLeft: 4, fontSize: 12, color: '#666' }}>{rating}</Text>
    </View>
  );
}

function AttractionDetail({ attraction, visible, onClose }) {
  if (!attraction) return null;

  const openMap = () => {
    const url = `maps://app?daddr=${attraction.latitude},${attraction.longitude}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://maps.google.com/?q=${attraction.latitude},${attraction.longitude}`);
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <ScrollView style={styles.modalContainer}>
        <Image
          source={{ uri: attraction.image }}
          style={styles.detailImage}
          defaultSource={{ uri: 'https://via.placeholder.com/400x250?text=Loading...' }}
        />
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.detailContent}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailName}>{attraction.name}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{attraction.category}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="location" size={16} color="#667eea" />
            <Text style={styles.detailCity}>{attraction.city}, {attraction.country}</Text>
          </View>

          <StarRating rating={attraction.rating} />

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="time" size={18} color="#4ECDC4" />
              <Text style={styles.infoLabel}>開放時間</Text>
              <Text style={styles.infoValue}>{attraction.openHours}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="ticket" size={18} color="#FF6B6B" />
              <Text style={styles.infoLabel}>票價</Text>
              <Text style={styles.infoValue}>{attraction.price}</Text>
            </View>
          </View>

          <Text style={styles.descTitle}>景點介紹</Text>
          <Text style={styles.description}>{attraction.description}</Text>

          <View style={styles.tagsRow}>
            {attraction.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.mapBtn} onPress={openMap}>
            <Ionicons name="map" size={20} color="#fff" />
            <Text style={styles.mapBtnText}>在地圖上查看</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Modal>
  );
}

export default function ExploreScreen() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const filtered = ATTRACTIONS.filter((a) => {
    const matchSearch = a.name.includes(search) || a.city.includes(search) || a.description.includes(search);
    const matchCategory = selectedCategory === '全部' || a.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="搜尋景點、城市..."
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryRow}
        contentContainerStyle={{ paddingHorizontal: 15 }}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryBtn, selectedCategory === cat && styles.categoryBtnActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.categoryBtnText, selectedCategory === cat && styles.categoryBtnTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 15 }}>
        <Text style={styles.resultCount}>找到 {filtered.length} 個景點</Text>
        {filtered.map((attraction) => (
          <TouchableOpacity
            key={attraction.id}
            style={styles.card}
            onPress={() => { setSelectedAttraction(attraction); setDetailVisible(true); }}
          >
            <Image
              source={{ uri: attraction.image }}
              style={styles.cardImage}
              defaultSource={{ uri: 'https://via.placeholder.com/400x200?text=Loading...' }}
            />
            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardName}>{attraction.name}</Text>
                <View style={[styles.categoryBadge, { marginLeft: 0 }]}>
                  <Text style={styles.categoryText}>{attraction.category}</Text>
                </View>
              </View>
              <View style={styles.cardLocation}>
                <Ionicons name="location" size={13} color="#667eea" />
                <Text style={styles.cardLocationText}>{attraction.city}</Text>
              </View>
              <StarRating rating={attraction.rating} />
              <Text style={styles.cardDesc} numberOfLines={2}>{attraction.description}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardPrice}>{attraction.price}</Text>
                <Text style={styles.cardHours}>{attraction.openHours}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <AttractionDetail
        attraction={selectedAttraction}
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  searchContainer: { backgroundColor: '#667eea', paddingTop: 55, paddingBottom: 15, paddingHorizontal: 15 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 25,
    paddingHorizontal: 15, paddingVertical: 10,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#333' },
  categoryRow: { backgroundColor: '#fff', paddingVertical: 10, maxHeight: 55 },
  categoryBtn: {
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#f0f0f0', marginRight: 8,
  },
  categoryBtnActive: { backgroundColor: '#667eea' },
  categoryBtnText: { fontSize: 13, color: '#666' },
  categoryBtnTextActive: { color: '#fff', fontWeight: '600' },
  resultCount: { fontSize: 13, color: '#999', marginBottom: 10 },
  card: {
    backgroundColor: '#fff', borderRadius: 15, marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  cardImage: { width: '100%', height: 180 },
  cardBody: { padding: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  cardName: { fontSize: 17, fontWeight: 'bold', color: '#333', flex: 1 },
  categoryBadge: {
    backgroundColor: '#EEF2FF', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8,
  },
  categoryText: { fontSize: 11, color: '#667eea', fontWeight: '600' },
  cardLocation: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  cardLocationText: { fontSize: 12, color: '#667eea', marginLeft: 3 },
  cardDesc: { fontSize: 13, color: '#666', marginTop: 8, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cardPrice: { fontSize: 12, color: '#FF6B6B', fontWeight: '600' },
  cardHours: { fontSize: 12, color: '#999' },
  // Modal styles
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  detailImage: { width: '100%', height: 280 },
  closeBtn: {
    position: 'absolute', top: 50, right: 15,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  detailContent: { padding: 20 },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  detailName: { fontSize: 24, fontWeight: 'bold', color: '#333', flex: 1 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailCity: { fontSize: 14, color: '#667eea', marginLeft: 4 },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#f8f9fa', borderRadius: 12, padding: 15, marginVertical: 15 },
  infoItem: { alignItems: 'center' },
  infoLabel: { fontSize: 11, color: '#999', marginTop: 4 },
  infoValue: { fontSize: 13, color: '#333', fontWeight: '600', marginTop: 2 },
  descTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  description: { fontSize: 14, color: '#666', lineHeight: 22 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 15 },
  tag: { backgroundColor: '#EEF2FF', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginRight: 8, marginBottom: 8 },
  tagText: { fontSize: 12, color: '#667eea' },
  mapBtn: {
    backgroundColor: '#667eea', borderRadius: 12, paddingVertical: 14,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20,
  },
  mapBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
});
