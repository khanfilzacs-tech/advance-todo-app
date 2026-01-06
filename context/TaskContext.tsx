import { Task } from '@/components/TaskCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

interface TaskContextType {
    tasks: Task[];
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    toggleTask: (id: string) => void;
    loading: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

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

    const addTask = (newTask: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
        const task: Task = {
            id: uuidv4(),
            createdAt: Date.now(),
            completed: false,
            ...newTask,
        };
        setTasks(prev => [task, ...prev]);
    };

    const updateTask = (id: string, updates: Partial<Task>) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const deleteTask = (id: string) => {
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
