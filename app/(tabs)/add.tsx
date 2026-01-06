import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { useTasks } from '@/context/TaskContext';

export default function AddTaskScreen() {
    const router = useRouter();
    const { addTask } = useTasks();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Personal');
    const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
    const [dueDate, setDueDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleSave = () => {
        if (!title.trim()) {
            // Simple validation
            return;
        }

        addTask({
            title,
            description,
            category,
            priority,
            dueDate: dueDate.toISOString(),
        });

        router.back();
    };

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDueDate(selectedDate);
        }
    };

    const PriorityBadge = ({ level, label, active }: { level: 'high' | 'medium' | 'low', label: string, active: boolean }) => (
        <TouchableOpacity
            style={[
                styles.priorityBadge,
                {
                    backgroundColor: active ? Colors.priorities[level] : theme.card,
                    borderColor: active ? Colors.priorities[level] : theme.border,
                    borderWidth: 1
                }
            ]}
            onPress={() => setPriority(level)}
        >
            <Text style={{
                color: active ? '#FFF' : theme.text,
                fontWeight: '600'
            }}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={[GlobalStyles.container, { backgroundColor: theme.background }]}>
            <Text style={[GlobalStyles.title, { color: theme.text, marginTop: 20 }]}>New Task</Text>

            <Input
                label="Task Title"
                placeholder="What needs to be done?"
                value={title}
                onChangeText={setTitle}
            />

            <Input
                label="Description"
                placeholder="Add details..."
                value={description}
                onChangeText={setDescription}
                multiline
                style={{ height: 100, textAlignVertical: 'top', paddingTop: 10 }}
            />

            <Input
                label="Category"
                placeholder="e.g. Work, Personal, Shopping"
                value={category}
                onChangeText={setCategory}
            />

            <Text style={[styles.sectionLabel, { color: theme.text }]}>Priority</Text>
            <View style={styles.priorityContainer}>
                <PriorityBadge level="low" label="Low" active={priority === 'low'} />
                <PriorityBadge level="medium" label="Medium" active={priority === 'medium'} />
                <PriorityBadge level="high" label="High" active={priority === 'high'} />
            </View>

            <Text style={[styles.sectionLabel, { color: theme.text }]}>Due Date</Text>
            <TouchableOpacity
                style={[styles.dateButton, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => setShowDatePicker(true)}
            >
                <Ionicons name="calendar" size={20} color={theme.textSecondary} />
                <Text style={[styles.dateText, { color: theme.text }]}>
                    {dueDate.toLocaleString()}
                </Text>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={dueDate}
                    mode="datetime"
                    display="default"
                    onChange={onDateChange}
                />
            )}

            <View style={{ height: 40 }} />

            <Button title="Create Task" onPress={handleSave} size="large" />
            <Button
                title="Cancel"
                onPress={() => router.back()}
                variant="ghost"
                style={{ marginTop: 10 }}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 8,
    },
    priorityContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 10,
    },
    priorityBadge: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        minWidth: 80,
        alignItems: 'center',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderRadius: 12,
        marginBottom: 20,
    },
    dateText: {
        marginLeft: 10,
        fontSize: 16,
    },
});
