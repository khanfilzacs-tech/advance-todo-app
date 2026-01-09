import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { useTasks } from '@/context/TaskContext';

export default function EditTaskScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { tasks, updateTask, deleteTask } = useTasks();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Personal');
    const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
    const [dueDate, setDueDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Notification state
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState(new Date());
    const [showReminderPicker, setShowReminderPicker] = useState(false);

    const [reminderPickerMode, setReminderPickerMode] = useState<'date' | 'time'>('date');
    const [datePickerMode, setDatePickerMode] = useState<'date' | 'time'>('date');

    useEffect(() => {
        if (id) {
            const task = tasks.find(t => t.id === id);
            if (task) {
                setTitle(task.title);
                setDescription(task.description || '');
                setCategory(task.category);
                setPriority(task.priority);
                setDueDate(new Date(task.dueDate));

                if (task.reminderEnabled && task.reminderTime) {
                    setReminderEnabled(true);
                    setReminderTime(new Date(task.reminderTime));
                } else {
                    setReminderEnabled(false);
                    // Default reminder time just in case user enables it
                    setReminderTime(new Date(new Date(task.dueDate).getTime() - 10 * 60000));
                }
            }
        }
    }, [id, tasks]);

    const handleSave = async () => {
        if (!title.trim() || typeof id !== 'string') {
            return;
        }

        await updateTask(id, {
            title,
            description,
            category,
            priority,
            dueDate: dueDate.toISOString(),
            reminderEnabled,
            reminderTime: reminderEnabled ? reminderTime.toISOString() : undefined,
        });

        router.back();
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Task",
            "Are you sure you want to delete this task?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        if (typeof id === 'string') {
                            await deleteTask(id);
                            router.back();
                        }
                    }
                }
            ]
        );
    };

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (event.type === 'dismissed') {
            setShowDatePicker(false);
            return;
        }

        if (selectedDate) {
            if (Platform.OS === 'android' && datePickerMode === 'date') {
                setShowDatePicker(false); // Close date picker
                setDueDate(selectedDate); // Store date part
                // Open time picker after a small delay to ensure modal close
                setTimeout(() => {
                    setDatePickerMode('time');
                    setShowDatePicker(true);
                }, 100);
            } else {
                // If iOS (datetime) or Android (time mode)
                // For Android time mode, we need to combine date and time
                if (Platform.OS === 'android' && datePickerMode === 'time') {
                    const newDate = new Date(dueDate);
                    newDate.setHours(selectedDate.getHours());
                    newDate.setMinutes(selectedDate.getMinutes());
                    setDueDate(newDate);
                    setShowDatePicker(false);
                    setDatePickerMode('date'); // Reset for next time
                } else {
                    // iOS
                    setDueDate(selectedDate);
                    setShowDatePicker(false); // iOS usually doesn't need distinct close but standard logic
                }
            }
        }
    };

    const onReminderDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (event.type === 'dismissed') {
            setShowReminderPicker(false);
            return;
        }

        if (selectedDate) {
            if (Platform.OS === 'android' && reminderPickerMode === 'date') {
                setShowReminderPicker(false);
                setReminderTime(selectedDate);
                setTimeout(() => {
                    setReminderPickerMode('time');
                    setShowReminderPicker(true);
                }, 100);
            } else {
                if (Platform.OS === 'android' && reminderPickerMode === 'time') {
                    const newDate = new Date(reminderTime);
                    newDate.setHours(selectedDate.getHours());
                    newDate.setMinutes(selectedDate.getMinutes());
                    setReminderTime(newDate);
                    setShowReminderPicker(false);
                    setReminderPickerMode('date');
                } else {
                    setReminderTime(selectedDate);
                    setShowReminderPicker(false);
                }
            }
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

    const showDatepicker = () => {
        setDatePickerMode('date');
        setShowDatePicker(true);
    };

    const showReminderpicker = () => {
        setReminderPickerMode('date');
        setShowReminderPicker(true);
    };

    return (
        <ScrollView style={[GlobalStyles.container, { backgroundColor: theme.background }]}>
            <View style={{ marginBottom: 20, marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[GlobalStyles.title, { color: theme.text, marginBottom: 0 }]}>Edit Task</Text>
                <TouchableOpacity onPress={handleDelete} style={{ padding: 8 }}>
                    <Ionicons name="trash-outline" size={24} color={Colors.error} />
                </TouchableOpacity>
            </View>

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
                onPress={showDatepicker}
            >
                <Ionicons name="calendar" size={20} color={theme.textSecondary} />
                <Text style={[styles.dateText, { color: theme.text }]}>
                    {dueDate.toLocaleString()}
                </Text>
            </TouchableOpacity>

            <View style={[styles.switchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.switchLabelContainer}>
                    <Ionicons name="notifications-outline" size={22} color={theme.text} />
                    <Text style={[styles.switchLabel, { color: theme.text }]}>Remind Me</Text>
                </View>
                <Switch
                    value={reminderEnabled}
                    onValueChange={setReminderEnabled}
                    trackColor={{ true: Colors.primary }}
                />
            </View>

            {reminderEnabled && (
                <TouchableOpacity
                    style={[styles.dateButton, { backgroundColor: theme.card, borderColor: theme.border, marginTop: -10 }]}
                    onPress={showReminderpicker}
                >
                    <Ionicons name="time-outline" size={20} color={theme.textSecondary} />
                    <Text style={[styles.dateText, { color: theme.text }]}>
                        {reminderTime.toLocaleString()}
                    </Text>
                </TouchableOpacity>
            )}

            {showDatePicker && (
                <DateTimePicker
                    value={dueDate}
                    mode={Platform.OS === 'android' ? datePickerMode : 'datetime'}
                    display="default"
                    onChange={onDateChange}
                />
            )}

            {showReminderPicker && (
                <DateTimePicker
                    value={reminderTime}
                    mode={Platform.OS === 'android' ? reminderPickerMode : 'datetime'}
                    display="default"
                    onChange={onReminderDateChange}
                />
            )}

            <View style={{ height: 40 }} />

            <Button title="Save Changes" onPress={handleSave} size="large" />
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
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderRadius: 12,
        marginBottom: 20,
    },
    switchLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
});
