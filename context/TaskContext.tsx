// ```javascript
import { Task } from '@/components/TaskCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { useNotifications } from './NotificationContext';

interface TaskContextType {
    tasks: Task[];
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => Promise<void>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    toggleTask: (id: string) => void;
    loading: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const { scheduleReminder, cancelReminder } = useNotifications();

    // Load tasks from storage
    useEffect(() => {
        loadTasks();
    }, []);

    // Save tasks whenever they change
    useEffect(() => {
        if (!loading) {
            saveTasks(tasks);
        }
    }, [tasks]);

    const loadTasks = async () => {
        try {
            const storedTasks = await AsyncStorage.getItem('@tasks');
            if (storedTasks) {
                setTasks(JSON.parse(storedTasks));
            }
        } catch (e) {
            console.error('Failed to load tasks', e);
        } finally {
            setLoading(false);
        }
    };

    const saveTasks = async (currentTasks: Task[]) => {
        try {
            await AsyncStorage.setItem('@tasks', JSON.stringify(currentTasks));
        } catch (e) {
            console.error('Failed to save tasks', e);
        }
    };

    const addTask = async (newTask: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
        let notificationId;

        if (newTask.reminderEnabled && newTask.reminderTime) {
            console.log("reminder added")
            notificationId = await scheduleReminder(
                `Reminder: ${newTask.title} `,
                newTask.description || 'You have a task due soon!',
                new Date(newTask.reminderTime)
            );
        }

        const task: Task = {
            id: uuidv4(),
            createdAt: Date.now(),
            completed: false,
            ...newTask,
            notificationIdentifier: notificationId,
        };
        setTasks(prev => [task, ...prev]);
    };

    const updateTask = async (id: string, updates: Partial<Task>) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        let notificationId = task.notificationIdentifier;

        // Check if we need to reschedule
        const timeChanged = updates.reminderTime && updates.reminderTime !== task.reminderTime;
        const enabledChanged = updates.reminderEnabled !== undefined && updates.reminderEnabled !== task.reminderEnabled;
        const targetEnabled = updates.reminderEnabled !== undefined ? updates.reminderEnabled : task.reminderEnabled;
        const targetTime = updates.reminderTime || task.reminderTime;
        const targetTitle = updates.title || task.title;
        const targetDesc = updates.description || task.description;

        if (timeChanged || enabledChanged || ((updates.title || updates.description) && targetEnabled)) {
            // Cancel old if exists
            if (notificationId) {
                await cancelReminder(notificationId);
                notificationId = undefined;
            }

            // Schedule new if enabled and has time
            if (targetEnabled && targetTime) {
                notificationId = await scheduleReminder(
                    `Reminder: ${targetTitle} `,
                    targetDesc || 'You have a task due soon!',
                    new Date(targetTime)
                );
            }
        }

        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, notificationIdentifier: notificationId } : t));
    };

    const deleteTask = async (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (task && task.notificationIdentifier) {
            await cancelReminder(task.notificationIdentifier);
        }
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const toggleTask = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    return (
        <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask, toggleTask, loading }}>
            {children}
        </TaskContext.Provider>
    );
}

export function useTasks() {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
}
