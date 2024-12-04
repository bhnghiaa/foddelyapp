import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Animated,
    Dimensions,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useUser from '../hook/useUser';
import { User } from '../@types';
import VerticalShimmer from './Shimmers/VerticalShimmer';

const { width } = Dimensions.get('window');


const Users = () => {
    const [ activeTab, setActiveTab ] = useState('Đã xác thực');
    const [ refreshing, setRefreshing ] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;
    const { users, loading, error, refetch } = useUser();
    const { updateAccount } = useUser();
    const filteredUsers = users.filter(user =>
        (activeTab === 'Đã xác thực' && user.verification) || (activeTab === 'Đang chờ' && !user.verification)
    );

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        refetch();
        setTimeout(() => setRefreshing(false), 2000);
    }, []);

    const renderUserItem = ({ item, index }: { item: User; index: number }) => {
        const inputRange = [ -1, 0, (index + 1) * 80, (index + 2) * 80 ];
        const scale = scrollY.interpolate({
            inputRange,
            outputRange: [ 1, 1, 1, 0.9 ],
        });
        const opacity = scrollY.interpolate({
            inputRange,
            outputRange: [ 1, 1, 1, 0 ],
        });

        const handleVerification = async (userId: string, newStatus: boolean) => {
            try {
                console.log("userId", userId);
                await updateAccount(userId, { verification: newStatus });
                refetch(); // Refresh the list after update
            } catch (error) {
                console.error('Error updating verification status:', error);
            }
        };

        return (
            <Animated.View style={[ styles.userItem, { transform: [ { scale } ], opacity } ]}>
                <Image
                    source={{ uri: item.profile }}
                    style={styles.avatar}
                />
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.username}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    <View style={styles.actionButtons}>
                        {item.verification ? (
                            <TouchableOpacity
                                style={[ styles.actionButton, styles.lockButton ]}
                                onPress={() => handleVerification(item._id, false)}
                            >
                                <Icon name="lock" size={16} color="#fff" />
                                <Text style={styles.actionButtonText}>Khóa</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[ styles.actionButton, styles.verifyButton ]}
                                onPress={() => handleVerification(item._id, true)}
                            >
                                <Icon name="check-circle" size={16} color="#fff" />
                                <Text style={styles.actionButtonText}>Xác thực</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                <View style={[ styles.userType, item.userType === 'Driver' && styles.vendorType ]}>
                    <Text style={styles.userTypeText}>
                        {item.userType === 'Driver' ? 'Tài xế' : 'khách hàng'}
                    </Text>
                </View>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Người dùng</Text>
                <View style={styles.tabContainer}>
                    {[ 'Đã xác thực', 'Đang chờ' ].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[ styles.tab, activeTab === tab && styles.activeTab ]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[ styles.tabText, activeTab === tab && styles.activeTabText ]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
            {loading && <VerticalShimmer width={'100%'} height={60} radius={18} />}
            <Animated.FlatList
                data={filteredUsers}
                renderItem={renderUserItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4CD964" />
                }
            />
        </SafeAreaView>
    );
};

const existingStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    listContent: {
        paddingTop: 16,
        paddingHorizontal: 16,
    },
    header: {
        padding: 16,

    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4A4A4A',
        marginBottom: 16,
    },
    tabContainer: {
        flexDirection: 'row',
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 8,
        backgroundColor: '#F0F0F0',
    },
    activeTab: {
        backgroundColor: '#4CD964',
    },
    tabText: {
        color: '#4A4A4A',
    },
    activeTabText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#F8F8F8',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4A4A4A',
    },
    userEmail: {
        fontSize: 14,
        color: '#888888',
        marginTop: 4,
    },
    userType: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#4CD964',
        borderRadius: 16,
    },
    vendorType: {
        backgroundColor: '#FF9500',
    },
    userTypeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4CD964',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
});

const newStyles = StyleSheet.create({
    actionButtons: {
        flexDirection: 'row',
        marginTop: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
    },
    verifyButton: {
        backgroundColor: '#4CD964',
    },
    lockButton: {
        backgroundColor: '#FF3B30',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    userItem: {
        ...existingStyles.userItem,
        paddingVertical: 16,
    },
    userInfo: {
        ...existingStyles.userInfo,
        marginRight: 12,
    },
});

const styles = StyleSheet.create({
    ...existingStyles,
    ...newStyles,
});

export default Users;
