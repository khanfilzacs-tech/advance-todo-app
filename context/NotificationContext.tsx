import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowList: false,
        shouldShowBanner: false
    }),
});

interface NotificationContextType {
    notificationsEnabled: boolean;
    toggleNotifications: (value: boolean) => Promise<void>;
    scheduleReminder: (title: string, body: string, date: Date) => Promise<string | undefined>;
    cancelReminder: (notificationId: string) => Promise<void>;
    cancelAllReminders: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    useEffect(() => {
        checkPermissionStatus();
    }, []);

    const checkPermissionStatus = async () => {
        try {
            const storedPreference = await AsyncStorage.getItem('notificationsEnabled');
            if (storedPreference !== null) {
                setNotificationsEnabled(storedPreference === 'true');
                return;
            }

            // If no preference stored, check actual permission status
            const { status } = await Notifications.getPermissionsAsync();
            setNotificationsEnabled(status === 'granted');
        } catch (e) {
            console.error('Failed to load notification preference', e);
        }
    };

    const requestPermissions = async () => {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            Alert.alert('Permission needed', 'Please enable notifications in your settings to receive reminders.');
            return false;
        }

        return true;
    };

    const toggleNotifications = async (value: boolean) => {
        if (value) {
            const granted = await requestPermissions();
            if (!granted) {
                // Permission denied, keep disabled
                return;
            }
        } else {
            // If turning off, maybe cancel all pending reminders? 
            // Requirement says: "Cancel scheduled notifications when ... reminders are turned off."
            await cancelAllReminders();
        }

        setNotificationsEnabled(value);
        await AsyncStorage.setItem('notificationsEnabled', String(value));
    };

    const scheduleReminder = async (title: string, body: string, date: Date) => {
        if (!notificationsEnabled) return undefined;

        // Ensure date is in the future
        if (date.getTime() <= Date.now()) {
            return undefined;
        }

        try {
            const id = await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    sound: true,
                },
                trigger: {
                    date, // Schedule at specific date
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                } as any, // casting as any because different trigger types can be tricky in TS
            });
            return id;
        } catch (e) {
            console.error('Failed to schedule notification', e);
            return undefined;
        }
    };

    const cancelReminder = async (notificationId: string) => {
        try {
            await Notifications.cancelScheduledNotificationAsync(notificationId);
        } catch (e) {
            console.error('Failed to cancel notification', e);
        }
    };

    const cancelAllReminders = async () => {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
        } catch (e) {
            console.error('Failed to cancel all notifications', e);
        }
    };

    return (
        <NotificationContext.Provider value={{
            notificationsEnabled,
            toggleNotifications,
            scheduleReminder,
            cancelReminder,
            cancelAllReminders
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
