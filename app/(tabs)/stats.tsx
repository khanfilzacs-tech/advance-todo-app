import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { useTasks } from '@/context/TaskContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function StatsScreen() {
    const { tasks } = useTasks();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const chartConfig = {
        backgroundGradientFrom: theme.background,
        backgroundGradientTo: theme.background,
        color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
        strokeWidth: 2,
    };

    const data = [
        {
            name: 'Completed',
            population: completedTasks,
            color: Colors.success,
            legendFontColor: theme.text,
            legendFontSize: 15,
        },
        {
            name: 'Pending',
            population: pendingTasks,
            color: Colors.warning,
            legendFontColor: theme.text,
            legendFontSize: 15,
        },
    ];

    return (
        <ScrollView style={[GlobalStyles.container, { backgroundColor: theme.background }]}>
            <Text style={[GlobalStyles.title, { color: theme.text, marginTop: 20 }]}>Statistics</Text>

            <View style={[styles.card, { backgroundColor: theme.card }, GlobalStyles.shadow]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>Progress Overview</Text>
                <View style={styles.chartContainer}>
                    {totalTasks > 0 ? (
                        <PieChart
                            data={data}
                            width={screenWidth - 60}
                            height={220}
                            chartConfig={chartConfig}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            absolute
                        />
                    ) : (
                        <Text style={{ color: theme.textSecondary, textAlign: 'center', marginVertical: 20 }}>
                            No tasks yet to show statistics.
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: theme.card }, GlobalStyles.shadow]}>
                    <Ionicons name="checkmark-circle-outline" size={24} color={Colors.success} />
                    <Text style={[styles.statValue, { color: theme.text }]}>{completedTasks}</Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completed</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: theme.card }, GlobalStyles.shadow]}>
                    <Ionicons name="time-outline" size={24} color={Colors.warning} />
                    <Text style={[styles.statValue, { color: theme.text }]}>{pendingTasks}</Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pending</Text>
                </View>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.card, width: '100%', marginTop: 10 }, GlobalStyles.shadow]}>
                <Text style={[styles.completionPercentage, { color: Colors.primary }]}>{completionRate}%</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completion Rate</Text>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    statCard: {
        borderRadius: 16,
        padding: 16,
        width: '48%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 14,
        marginTop: 4,
    },
    completionPercentage: {
        fontSize: 36,
        fontWeight: 'bold',
    },
});
