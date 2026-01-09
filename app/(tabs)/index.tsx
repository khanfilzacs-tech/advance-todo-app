import { TaskCard } from '@/components/TaskCard';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { useTasks } from '@/context/TaskContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { tasks, toggleTask } = useTasks();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;

      return matchesSearch && matchesPriority;
    }).sort((a, b) => {
      // Sort by completion (pending first) then by date
      if (a.completed === b.completed) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return a.completed ? 1 : -1;
    });
  }, [tasks, searchQuery, filterPriority]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>{greeting},</Text>
          <Text style={[styles.userName, { color: theme.text }]}>Guest User</Text>
        </View>
        <TouchableOpacity style={styles.avatar} onPress={() => router.push('/(tabs)/profile')}>
          <Ionicons name="person" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <Input
        placeholder="Search tasks..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
      />

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, filterPriority === 'all' && { backgroundColor: Colors.primary }]}
          onPress={() => setFilterPriority('all')}
        >
          <Text style={[styles.filterText, filterPriority === 'all' && { color: '#FFF' }]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterPriority === 'high' && { backgroundColor: Colors.primary }]}
          onPress={() => setFilterPriority('high')}
        >
          <Text style={[styles.filterText, filterPriority === 'high' && { color: '#FFF' }]}>High</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterPriority === 'medium' && { backgroundColor: Colors.primary }]}
          onPress={() => setFilterPriority('medium')}
        >
          <Text style={[styles.filterText, filterPriority === 'medium' && { color: '#FFF' }]}>Medium</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterPriority === 'low' && { backgroundColor: Colors.primary }]}
          onPress={() => setFilterPriority('low')}
        >
          <Text style={[styles.filterText, filterPriority === 'low' && { color: '#FFF' }]}>Low</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 10 }]}>
        My Tasks ({filteredTasks.length})
      </Text>
    </View>
  );

  return (
    <View style={[GlobalStyles.container, { backgroundColor: theme.background, paddingTop: 40 }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      {renderHeader()}
      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => {
              //task/1
              router.push(`./task/${item.id}`);
            }}
            onToggleComplete={() => toggleTask(item.id)}
          />
        )}
        // ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={64} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No tasks found</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E4E9F2', // Default chip color
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E3A59',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
  },
});
