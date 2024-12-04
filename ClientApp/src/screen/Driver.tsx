import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Image,
    TouchableOpacity,
    Platform,
    StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

export function OrderScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.locationContainer}>
                    <Image
                        source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRC6iPDSqcgCcAtdEz_rPY0B-sxqMd7hz0Hlg&s' }}
                        style={styles.avatar}
                    />
                    <View style={styles.locationText}>
                        <Text style={styles.locationLabel}>Vị trí hiện tại</Text>
                        <Text style={styles.locationValue}>Đại học Kinh tế Quốc dân</Text>
                    </View>
                </View>
                <View style={styles.headerRight}>
                    <Text style={styles.time}>14:24</Text>
                    <TouchableOpacity>
                        <Icon name="sun" size={20} color="#FFD700" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Status Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity style={[ styles.tab, styles.activeTab ]}>
                    <Text style={[ styles.tabText, styles.activeTabText ]}>Sẵn sàng</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tab}>
                    <Text style={styles.tabText}>Đang giao</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tab}>
                    <Text style={styles.tabText}>Đã giao</Text>
                </TouchableOpacity>
            </View>

            {/* Order Card */}
            <View style={styles.orderCard}>
                <View style={styles.orderContent}>
                    <Image
                        source={{ uri: 'https://res.cloudinary.com/diadiykyk/image/upload/v1731806480/p0z4ui1oqtmssyxpzyao.jpg' }}
                        style={styles.foodImage}
                    />
                    <View style={styles.orderDetails}>
                        <Text style={styles.foodTitle}>Phở trộn</Text>
                        <View style={styles.locationRow}>
                            <Icon name="map-pin" size={14} color="#666" />
                            <Text style={styles.orderLocation}>339 Trần Đại Nghĩa</Text>
                        </View>
                        <View style={styles.statsRow}>
                            <View style={styles.stat}>
                                <Icon name="truck" size={14} color="#666" />
                                <Text style={styles.statText}>1.12km</Text>
                            </View>
                            <View style={styles.stat}>
                                <Icon name="dollar-sign" size={14} color="#666" />
                                <Text style={styles.statText}>62,005 đ</Text>
                            </View>
                            <View style={styles.stat}>
                                <Icon name="clock" size={14} color="#666" />
                                <Text style={styles.statText}>25 min</Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.pickupButton}>
                        <Text style={styles.pickupText}>Nhận đơn</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Bottom Tab Bar */}
            <View style={styles.tabBar}>
                <TouchableOpacity style={styles.tabBarItem}>
                    <Icon name="grid" size={24} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabBarItem}>
                    <Icon name="map-pin" size={24} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabBarItem}>
                    <Icon name="user" size={24} color="#666" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
    },
    locationText: {
        flex: 1,
    },
    locationLabel: {
        fontSize: 12,
        color: '#666',
    },
    locationValue: {
        fontSize: 14,
        color: '#000',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    time: {
        fontSize: 14,
        color: '#000',
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#10b981',
    },
    tabText: {
        fontSize: 14,
        color: '#666',
    },
    activeTabText: {
        color: '#10b981',
        fontWeight: '600',
    },
    orderCard: {
        margin: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    orderContent: {
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    foodImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    orderDetails: {
        flex: 1,
    },
    foodTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
    },
    orderLocation: {
        fontSize: 12,
        color: '#666',
        flex: 1,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 12,
        color: '#666',
    },
    pickupButton: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    pickupText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 16,
        backgroundColor: '#10b981',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    },
    tabBarItem: {
        padding: 8,
    },
});