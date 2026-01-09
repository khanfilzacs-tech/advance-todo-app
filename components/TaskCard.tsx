import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { format } from 'date-fns';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

// Simple SVG Checkbox replacement since we are waiting for SVG lib install, 
// using View for now or vector icons if available. 
// Actually @expo/vector-icons is already in package.json.
import { Ionicons } from '@expo/vector-icons';

export interface Task {
    id: string;
    title: string;
    description?: string;
    category: string;
    priority: 'high' | 'medium' | 'low';
    dueDate: Date | string; // Handle both for safety
    completed: boolean;
    createdAt: number;
    reminderEnabled?: boolean;
    reminderTime?: string; // ISO Date string
    notificationIdentifier?: string;
}

interface TaskCardProps {
    task: Task;
    onPress: () => void;
    onToggleComplete: () => void;
}

export function TaskCard({ task, onPress, onToggleComplete }: TaskCardProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const priorityColor = Colors.priorities[task.priority];

    const formattedDate = task.dueDate
        ? format(new Date(task.dueDate), 'MMM d, h:mm a')
        : '';

    return (
        <TouchableOpacity
            style={[
                GlobalStyles.card,
                GlobalStyles.shadow,
                styles.cardContainer,
                { backgroundColor: theme.card }
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
                    <Text style={[styles.category, { color: theme.textSecondary }]}>{task.category}</Text>
                </View>

                <Text
                    style={[
                        styles.title,
                        {
                            color: task.completed ? theme.textSecondary : theme.text,
                            textDecorationLine: task.completed ? 'line-through' : 'none'
                        }
                    ]}
                    numberOfLines={1}
                >
                    {task.title}
                </Text>

                {task.description && (
                    <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
                        {task.description}
                    </Text>
                )}

                <View style={styles.footer}>
                    <Text style={[styles.date, { color: theme.textSecondary }]}>
                        <Ionicons name="calendar-outline" size={12} color={theme.textSecondary} /> {formattedDate}
                    </Text>
                </View>
            </View>

            <TouchableOpacity onPress={onToggleComplete} style={styles.checkboxContainer}>
                {task.completed ? (
                    <Ionicons name="checkmark-circle" size={28} color={Colors.success} />
                ) : (
                    <Ionicons name="ellipse-outline" size={28} color={theme.textSecondary} />
                )}
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    content: {
        flex: 1,
        marginRight: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    priorityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    category: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    description: {
        fontSize: 13,
        marginBottom: 8,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    date: {
        fontSize: 12,
    },
    checkboxContainer: {
        padding: 4,
    }
});
