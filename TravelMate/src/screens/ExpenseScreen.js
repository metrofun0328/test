import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Modal, Alert, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const CATEGORIES = [
  { id: 'food', label: '餐飲', icon: 'restaurant', color: '#FF6B6B' },
  { id: 'transport', label: '交通', icon: 'car', color: '#4ECDC4' },
  { id: 'hotel', label: '住宿', icon: 'bed', color: '#45B7D1' },
  { id: 'ticket', label: '門票', icon: 'ticket', color: '#96CEB4' },
  { id: 'shopping', label: '購物', icon: 'bag', color: '#FFEAA7' },
  { id: 'other', label: '其他', icon: 'ellipsis-horizontal', color: '#DDA0DD' },
];

function ExpenseForm({ visible, onClose, onSave }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('food');
  const [paidBy, setPaidBy] = useState('');
  const [participants, setParticipants] = useState('');
  const [currency, setCurrency] = useState('TWD');

  const handleSave = () => {
    if (!amount.trim() || isNaN(parseFloat(amount))) {
      Alert.alert('提醒', '請輸入正確的金額！');
      return;
    }
    if (!description.trim()) {
      Alert.alert('提醒', '請填寫消費說明！');
      return;
    }
    onSave({ amount: parseFloat(amount), description, category, paidBy, participants: participants.split(',').map(p => p.trim()).filter(Boolean), currency });
    setAmount(''); setDescription(''); setPaidBy(''); setParticipants('');
    onClose();
  };

  const selectedCat = CATEGORIES.find((c) => c.id === category);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.formContainer}>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>新增支出</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formBody}>
          {/* Category */}
          <Text style={styles.label}>消費類別</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catBtn, category === cat.id && { borderColor: cat.color, borderWidth: 2 }]}
                onPress={() => setCategory(cat.id)}
              >
                <View style={[styles.catIcon, { backgroundColor: cat.color + '30' }]}>
                  <Ionicons name={cat.icon} size={22} color={cat.color} />
                </View>
                <Text style={styles.catLabel}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount */}
          <Text style={styles.label}>金額 *</Text>
          <View style={styles.amountRow}>
            <TouchableOpacity
              style={styles.currencyBtn}
              onPress={() => setCurrency(currency === 'TWD' ? 'JPY' : currency === 'JPY' ? 'USD' : 'TWD')}
            >
              <Text style={styles.currencyText}>{currency}</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.input, styles.amountInput]}
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>

          <Text style={styles.label}>消費說明 *</Text>
          <TextInput style={styles.input} placeholder="例：午餐、捷運票、伴手禮..." value={description} onChangeText={setDescription} />

          <Text style={styles.label}>誰付款</Text>
          <TextInput style={styles.input} placeholder="付款人姓名" value={paidBy} onChangeText={setPaidBy} />

          <Text style={styles.label}>分帳成員（用逗號分隔）</Text>
          <TextInput
            style={styles.input}
            placeholder="例：小明, 小華, 小美"
            value={participants}
            onChangeText={setParticipants}
          />
          {participants.trim() && paidBy.trim() && (
            <View style={styles.splitPreview}>
              <Ionicons name="calculator" size={16} color="#667eea" />
              <Text style={styles.splitPreviewText}>
                每人應付：{currency} {(parseFloat(amount || 0) / (participants.split(',').filter(p => p.trim()).length || 1)).toFixed(0)}
              </Text>
            </View>
          )}
        </ScrollView>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>新增支出</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

function SummaryModal({ visible, onClose, expenses }) {
  const totalByCurrency = expenses.reduce((acc, e) => {
    acc[e.currency] = (acc[e.currency] || 0) + parseFloat(e.amount);
    return acc;
  }, {});

  const byCategory = CATEGORIES.map((cat) => {
    const total = expenses.filter((e) => e.category === cat.id).reduce((s, e) => s + parseFloat(e.amount), 0);
    return { ...cat, total };
  }).filter((c) => c.total > 0);

  const maxTotal = Math.max(...byCategory.map((c) => c.total), 1);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>支出統計</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ padding: 20 }}>
          <Text style={styles.summarySubtitle}>總花費</Text>
          {Object.entries(totalByCurrency).map(([cur, total]) => (
            <Text key={cur} style={styles.totalAmount}>{cur} {total.toFixed(0)}</Text>
          ))}
          {Object.keys(totalByCurrency).length === 0 && (
            <Text style={styles.totalAmount}>NT$ 0</Text>
          )}

          <Text style={[styles.summarySubtitle, { marginTop: 25 }]}>各類別支出</Text>
          {byCategory.map((cat) => (
            <View key={cat.id} style={styles.summaryRow}>
              <View style={[styles.catIcon, { backgroundColor: cat.color + '30', marginRight: 10 }]}>
                <Ionicons name={cat.icon} size={18} color={cat.color} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.summaryLabelRow}>
                  <Text style={styles.summaryLabel}>{cat.label}</Text>
                  <Text style={styles.summaryValue}>NT$ {cat.total.toFixed(0)}</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${(cat.total / maxTotal) * 100}%`, backgroundColor: cat.color }]} />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function ExpenseScreen() {
  const { expenses, addExpense, deleteExpense } = useApp();
  const [formVisible, setFormVisible] = useState(false);
  const [summaryVisible, setSummaryVisible] = useState(false);

  const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  const getCatInfo = (catId) => CATEGORIES.find((c) => c.id === catId) || CATEGORIES[5];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>記帳分帳</Text>
        <TouchableOpacity style={styles.statsBtn} onPress={() => setSummaryVisible(true)}>
          <Ionicons name="bar-chart" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Total Card */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>旅行總花費</Text>
        <Text style={styles.totalValue}>NT$ {total.toFixed(0)}</Text>
        <Text style={styles.totalCount}>{expenses.length} 筆支出記錄</Text>
      </View>

      <FlatList
        data={expenses.slice().reverse()}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 15 }}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={80} color="#ddd" />
            <Text style={styles.emptyTitle}>還沒有支出記錄</Text>
            <Text style={styles.emptySubtitle}>記錄每一筆旅遊花費！</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const cat = getCatInfo(item.category);
          const perPerson = item.participants?.length > 0
            ? (parseFloat(item.amount) / item.participants.length).toFixed(0)
            : null;

          return (
            <TouchableOpacity
              style={styles.expenseCard}
              onLongPress={() => Alert.alert('刪除支出', `確定要刪除「${item.description}」嗎？`, [
                { text: '取消' },
                { text: '刪除', style: 'destructive', onPress: () => deleteExpense(item.id) },
              ])}
            >
              <View style={[styles.expenseIcon, { backgroundColor: cat.color + '20' }]}>
                <Ionicons name={cat.icon} size={22} color={cat.color} />
              </View>
              <View style={styles.expenseContent}>
                <Text style={styles.expenseDesc}>{item.description}</Text>
                <Text style={styles.expenseCat}>{cat.label}</Text>
                {item.paidBy ? <Text style={styles.expensePaidBy}>由 {item.paidBy} 付款</Text> : null}
                {item.participants?.length > 0 && (
                  <Text style={styles.expenseSplit}>
                    {item.participants.join('、')} 各 {item.currency} {perPerson}
                  </Text>
                )}
              </View>
              <View style={styles.expenseRight}>
                <Text style={styles.expenseAmount}>{item.currency} {parseFloat(item.amount).toFixed(0)}</Text>
                <Text style={styles.expenseDate}>
                  {new Date(item.createdAt).toLocaleDateString('zh-TW')}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Add Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setFormVisible(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <ExpenseForm visible={formVisible} onClose={() => setFormVisible(false)} onSave={addExpense} />
      <SummaryModal visible={summaryVisible} onClose={() => setSummaryVisible(false)} expenses={expenses} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    backgroundColor: '#96CEB4', paddingTop: 55, paddingBottom: 15,
    paddingHorizontal: 20, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  statsBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center', alignItems: 'center',
  },
  totalCard: {
    backgroundColor: '#fff', margin: 15, borderRadius: 15,
    padding: 20, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  totalLabel: { fontSize: 14, color: '#999' },
  totalValue: { fontSize: 36, fontWeight: 'bold', color: '#333', marginVertical: 5 },
  totalCount: { fontSize: 12, color: '#ccc' },
  emptyState: { alignItems: 'center', paddingTop: 50 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#999', marginTop: 20 },
  emptySubtitle: { fontSize: 14, color: '#ccc', marginTop: 8 },
  expenseCard: {
    backgroundColor: '#fff', borderRadius: 15, padding: 15,
    flexDirection: 'row', alignItems: 'center', marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  expenseIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  expenseContent: { flex: 1 },
  expenseDesc: { fontSize: 15, fontWeight: '600', color: '#333' },
  expenseCat: { fontSize: 12, color: '#999', marginTop: 2 },
  expensePaidBy: { fontSize: 11, color: '#667eea', marginTop: 3 },
  expenseSplit: { fontSize: 11, color: '#96CEB4', marginTop: 2 },
  expenseRight: { alignItems: 'flex-end' },
  expenseAmount: { fontSize: 16, fontWeight: 'bold', color: '#FF6B6B' },
  expenseDate: { fontSize: 11, color: '#ccc', marginTop: 3 },
  fab: {
    position: 'absolute', right: 20, bottom: 30,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#96CEB4', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 8,
  },
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
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  catBtn: {
    width: '30%', alignItems: 'center', padding: 10,
    backgroundColor: '#f8f9fa', borderRadius: 12, marginBottom: 8,
    borderWidth: 1, borderColor: 'transparent',
  },
  catIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  catLabel: { fontSize: 12, color: '#666', marginTop: 5 },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  currencyBtn: {
    backgroundColor: '#667eea', borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 13,
  },
  currencyText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  amountInput: { flex: 1, fontSize: 22, fontWeight: 'bold' },
  input: {
    backgroundColor: '#f8f9fa', borderRadius: 10, padding: 12,
    fontSize: 15, color: '#333', borderWidth: 1, borderColor: '#eee',
  },
  splitPreview: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#EEF2FF', borderRadius: 8, padding: 10, marginTop: 8,
  },
  splitPreviewText: { color: '#667eea', fontWeight: '600', marginLeft: 6 },
  saveBtn: {
    backgroundColor: '#96CEB4', margin: 20, borderRadius: 12,
    paddingVertical: 15, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  // Summary
  summarySubtitle: { fontSize: 14, color: '#999', marginBottom: 8 },
  totalAmount: { fontSize: 32, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  summaryLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  summaryLabel: { fontSize: 14, color: '#333', fontWeight: '600' },
  summaryValue: { fontSize: 14, color: '#666' },
  barTrack: { height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
});
