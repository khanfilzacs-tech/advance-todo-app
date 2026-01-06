import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { useTasks } from '@/context/TaskContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

export default function ProfileScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { tasks } = useTasks();

    const handleClearData = async () => {
        Alert.alert(
            "Clear All Data",
            "Are you sure you want to delete all tasks? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await AsyncStorage.clear();
                        // In a real app we might reload or clear context, but this requires context support for clearing.
                        // For now just alert.
                        Alert.alert("Success", "All data cleared. Please restart the app.");
                    }
                }
            ]
        );
    };

    const SettingItem = ({ icon, title, value, onPress, isDestructive = false }: any) => (
        <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: isDestructive ? '#FFE5E5' : theme.background }]}>
                    <Ionicons name={icon} size={20} color={isDestructive ? Colors.error : theme.text} />
                </View>
                <Text style={[styles.settingTitle, { color: isDestructive ? Colors.error : theme.text }]}>{title}</Text>
            </View>
            {value}
        </TouchableOpacity>
    );

    return (
        <View style={[GlobalStyles.container, { backgroundColor: theme.background }]}>
            <Text style={[GlobalStyles.title, { color: theme.text, marginTop: 20 }]}>Profile</Text>

            <View style={[styles.profileHeader, { backgroundColor: theme.card }, GlobalStyles.shadow]}>
                <View style={styles.avatar}>
                    <Ionicons name="person" size={40} color="#FFF" />
                </View>
                <Text style={[styles.name, { color: theme.text }]}>Guest User</Text>
                <Text style={[styles.stats, { color: theme.textSecondary }]}>{tasks.length} Tasks Created</Text>
            </View>

            <View style={[styles.section, { backgroundColor: theme.card }, GlobalStyles.shadow]}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Settings</Text>

                <SettingItem
                    icon="moon-outline"
                    title="Dark Mode"
                    value={<Text style={{ color: theme.textSecondary }}>System Default</Text>}
                />

                <SettingItem
                    icon="notifications-outline"
                    title="Notifications"
                    value={<Switch value={true} trackColor={{ true: Colors.primary }} />}
                />

                <SettingItem
                    icon="trash-outline"
                    title="Clear All Data"
                    onPress={handleClearData}
                    isDestructive
                />
            </View>

            <View style={{ marginTop: 20 }}>
                <Text style={{ textAlign: 'center', color: theme.textSecondary }}>Version 1.0.0</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    profileHeader: {
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    name: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    stats: {
        fontSize: 14,
    },
    section: {
        borderRadius: 16,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 16,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
});
