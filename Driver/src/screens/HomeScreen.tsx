import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    SafeAreaView,
    FlatList,
} from 'react-native';
import Ready from '../components/Ready';
import OnDelivery from '../components/OnDelivery';
import Deliveried from '../components/Deliveried';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useAddress, useUserLocation } from '../hook/location/useFetchLocation';
import Cancelled from '../components/Cancelled';
import Pickup from '../components/Pickup';

const HomeScreen = () => {
    const [ activeTab, setActiveTab ] = useState('');
    const { userCoords, loading: locationLoading, refetch: refetchLocation, fetchLocation } = useUserLocation();
    const { address, loading: addressLoading, refetch: refetchAddress, fetchAddress } = useAddress();
    const { email, profile, userId, token, username } = useSelector((state: RootState) => state.user);

    const { isAvailable } = useSelector((state: RootState) => state.driver);
    const TabButton = ({ title, isActive, onPress }: { title: string; isActive: boolean; onPress: () => void }) => (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.tabButton,
                isActive && { borderBottomColor: '#00B14F', borderBottomWidth: 2 }
            ]}
        >
            <Text style={[
                styles.tabText,
                isActive && { color: '#00B14F' }
            ]}>
                {title}
            </Text>
        </TouchableOpacity>
    );

    const renderContent = () => {
        if (activeTab === 'ready') {
            return <Ready />;
        } else if (activeTab === 'delivering') {
            return <OnDelivery />;
        } else if (activeTab === 'delivered') {
            return <Deliveried />;
        } else if (activeTab === 'cancelled') {
            return <Cancelled />;
        } else if (activeTab === 'pickup') {
            return <Pickup />;
        }
        return null;
    };
    useEffect(() => {
        const initializeLocation = async () => {
            const coords = await fetchLocation();
            if (coords) {
                await fetchAddress(coords);
            }
        };
        initializeLocation();
    }, []);
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    {
                        profile ? (<Image
                            source={{ uri: profile }}
                            style={styles.avatar}
                        />) : (
                            <Image
                                source={require('../assets/avatar.png')}
                                style={styles.avatar}
                            />)
                    }
                    <View>
                        <Text style={styles.timeText}>{username}</Text>
                    </View>
                </View>

                <Text style={styles.addressText}>{isAvailable ? "Chưa nhận đơn hàng" : "Đang giao hàng"}</Text>
            </View>
            <View style={styles.tabContainer}>
                <TabButton
                    title="Sẵn sàng"
                    isActive={activeTab === 'ready'}
                    onPress={() => setActiveTab('ready')}
                />
                <TabButton
                    title="Đang lấy"
                    isActive={activeTab === 'pickup'}
                    onPress={() => setActiveTab('pickup')}
                />
                <TabButton
                    title="Đang giao"
                    isActive={activeTab === 'delivering'}
                    onPress={() => setActiveTab('delivering')}
                />
                <TabButton
                    title="Đã giao"
                    isActive={activeTab === 'delivered'}
                    onPress={() => setActiveTab('delivered')}
                />
                <TabButton
                    title="Đã hủy"
                    isActive={activeTab === 'cancelled'}
                    onPress={() => setActiveTab('cancelled')}
                />
            </View>

            {/* Content */}
            {renderContent()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    // header: {
    //     flexDirection: 'row',
    //     justifyContent: 'space-between',
    //     alignItems: 'center',
    //     padding: 16,
    //     borderBottomWidth: 1,
    //     borderBottomColor: '#EEEEEE',
    // },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        maxWidth: '70%',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    locationInfo: {
        justifyContent: 'center',
    },
    locationLabel: {
        fontSize: 12,
        color: '#666',
    },
    locationText: {
        fontSize: 14,
        fontWeight: '600',
    },
    weatherContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    timeText: {
        fontSize: 16,
        fontWeight: '500',
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    content: {
        flex: 1,
    },
    orderCard: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    foodImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    orderInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    foodName: {
        fontSize: 16,
        fontWeight: '600',
    },
    orderDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    addressText: {
        fontSize: 14,
        color: '#666',
    },
    orderMetrics: {
        flexDirection: 'row',
        gap: 12,
    },
    metricText: {
        fontSize: 14,
        color: '#666',
    },
    acceptButton: {
        backgroundColor: '#EEEEEE',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    acceptButtonText: {
        fontSize: 14,
        color: '#333',
    },
    placeholderText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
    },
    deliveryText: {
        fontSize: 14,
        color: '#666',
    },
    address: {
        fontSize: 14,
        fontWeight: 'bold',
        flexWrap: 'wrap',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 8,
        backgroundColor: '#fff',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        marginBottom: 8,
    },
});

export default HomeScreen;