import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MenuItem from '../components/MenuItem';
import Statistic from '../components/Statistic';
import Users from '../components/User';
import Foods from '../components/Foods';
import Categories from '../components/Categories';
import Orders from '../components/Orders';
import { RootState } from '../redux/store';
import { useSelector } from 'react-redux';
import Restaurant from '../components/Restaurant';
const menuItems = [
    { icon: 'store', label: 'Nhà hàng' },
    { icon: 'clipboard-list', label: 'Đơn hàng' },
    { icon: 'shape', label: 'Danh mục' },
    { icon: 'food', label: 'Món ăn' },
    { icon: 'account-group', label: 'Người dùng' },
    { icon: 'chart-bar', label: 'Thống kê' },
];

const AdminScreen = () => {
    const [ selectedMenu, setSelectedMenu ] = useState(menuItems[ 0 ].label);
    const { username } = useSelector((state: RootState) => state.user);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerRight}>
                    <Image
                        source={require('../assets/avatar.png')}
                        style={styles.avatar}
                    />
                    <Text style={styles.username}>{username}</Text>
                </View>
            </View>

            <View style={styles.menuContainer}>
                {menuItems.map((item) => (
                    <MenuItem
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        onPress={() => setSelectedMenu(item.label)}
                        isActive={selectedMenu === item.label}
                    />
                ))}
            </View>

            <View style={styles.content}>
                {selectedMenu === 'Nhà hàng' && <Restaurant />}
                {selectedMenu === 'Đơn hàng' && <Orders />}
                {selectedMenu === 'Danh mục' && <Categories />}
                {selectedMenu === 'Món ăn' && <Foods />}
                {selectedMenu === 'Người dùng' && <Users />}
                {selectedMenu === 'Thống kê' && <Statistic />}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F6FA',
    },
    header: {
        height: 64,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E9F2',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pageTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2D3748',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    username: {
        fontSize: 14,
        color: '#4A5568',
        fontWeight: '500',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: '#E2E8F0',
    },
    menuContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E9F2',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        marginTop: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
});

export default AdminScreen;
