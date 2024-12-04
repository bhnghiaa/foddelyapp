// Statistic.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import useUser from '../hook/useUser';
import useFetchOrders from '../hook/useFetchOrders';
import useFetchCategories from '../hook/useFetchCategories';

const AnimatedCounter: React.FC<{ end: number; duration?: number }> = ({ end, duration = 2000 }) => {
    const [ count, setCount ] = useState(0);

    useEffect(() => {
        let startTime = Date.now();
        const timer = setInterval(() => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            setCount(Math.floor(end * progress));
            if (progress === 1) clearInterval(timer);
        }, 16);
        return () => clearInterval(timer);
    }, [ end ]);

    return <Text style={styles.number}>{count}</Text>;
};

interface StatBoxProps {
    icon: string;
    number: number;
    label: string;
    color: string;
}

const StatBox: React.FC<StatBoxProps> = ({ icon, number, label, color }) => {
    return (
        <View style={[ styles.statBox, { backgroundColor: color } ]}>
            <MaterialCommunityIcons name={icon} size={24} color="#fff" />
            <AnimatedCounter end={number} />
            <Text style={styles.label}>{label}</Text>
        </View>
    );
};

const Statistic: React.FC = () => {
    const { users } = useUser();
    const { orderByAdmin } = useFetchOrders();
    const { categories } = useFetchCategories();

    const stats = [
        {
            icon: 'account-group',
            number: users.length,
            label: 'Người dùng',
            color: '#4A90E2',
        },
        {
            icon: 'account-check',
            number: users.filter(user => user.verification).length,
            label: 'Tài khoản đã xác minh',
            color: '#50C878',
        },
        {
            icon: 'shopping',
            number: orderByAdmin?.length || 0,
            label: 'Tổng số đơn hàng',
            color: '#F5A623',
        },
        {
            icon: 'shape',
            number: categories.length,
            label: 'Danh mục',
            color: '#8E44AD',
        },
    ];

    return (
        <View style={styles.container}>
            {stats.map((stat, index) => (
                <StatBox key={index} {...stat} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 8,
        backgroundColor: '#fff',
    },
    statBox: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        margin: 4,
        borderRadius: 8,
        width: '48%',
        aspectRatio: 1,
    },
    number: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginVertical: 4,
    },
    label: {
        fontSize: 12,
        color: '#fff',
        textAlign: 'center',
    },
});

export default Statistic;