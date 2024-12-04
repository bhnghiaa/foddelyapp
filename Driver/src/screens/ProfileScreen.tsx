import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../@types';
import { COLORS } from '../constants/theme';
import { logout } from '../redux/userSlice';

const ProfileScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const dispatch = useDispatch();
    const { username, email, profile } = useSelector((state: RootState) => state.user);

    const handleLogout = () => {
        dispatch(logout());
        navigation.reset({
            index: 0,
            routes: [ { name: 'Login' } ]
        });
    };

    return (
        <ScrollView style={styles.container}>
            {/* Profile Header */}
            <View style={styles.header}>
                <Image
                    source={profile ? { uri: profile } : require('../assets/avatar.png')}
                    style={styles.avatar}
                />
                <Text style={styles.name}>{username}</Text>
                <Text style={styles.email}>{email}</Text>
            </View>

            {/* Statistics */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>156</Text>
                    <Text style={styles.statLabel}>Đơn đã giao</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>4.2M</Text>
                    <Text style={styles.statLabel}>Tổng thu nhập</Text>
                </View>
            </View>

            {/* Menu Options */}
            <View style={styles.menuContainer}>
                <TouchableOpacity style={styles.menuItem}>
                    <MaterialIcons name="person" size={24} color="#666" />
                    <Text style={styles.menuText}>Thông tin cá nhân</Text>
                    <MaterialIcons name="chevron-right" size={24} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <MaterialIcons name="notifications" size={24} color="#666" />
                    <Text style={styles.menuText}>Thông báo</Text>
                    <MaterialIcons name="chevron-right" size={24} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <MaterialIcons name="history" size={24} color="#666" />
                    <Text style={styles.menuText}>Lịch sử giao hàng</Text>
                    <MaterialIcons name="chevron-right" size={24} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <MaterialIcons name="settings" size={24} color="#666" />
                    <Text style={styles.menuText}>Cài đặt</Text>
                    <MaterialIcons name="chevron-right" size={24} color="#666" />
                </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <MaterialIcons name="logout" size={24} color="#FF4444" />
                <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    email: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    rating: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    ratingCount: {
        fontSize: 14,
        color: '#666',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
        backgroundColor: '#fff',
        marginTop: 10,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    statDivider: {
        width: 1,
        height: '100%',
        backgroundColor: '#eee',
    },
    menuContainer: {
        backgroundColor: '#fff',
        marginTop: 10,
        paddingHorizontal: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    menuText: {
        flex: 1,
        marginLeft: 15,
        fontSize: 16,
        color: '#333',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginHorizontal: 20,
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FF4444',
    },
    logoutText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#FF4444',
        fontWeight: '500',
    },
});

export default ProfileScreen;