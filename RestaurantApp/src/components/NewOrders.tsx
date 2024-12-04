import { FC, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, FlatList, Image, TouchableOpacity, ActivityIndicator, Button } from 'react-native';
import useFetchUser from '../hook/useFetchUser';
import useFetchOrders from '../hook/order/useFetchOrders';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Order } from '../@types';
import useUpdateOrder from '../hook/order/useUpdateOrder';
import useFetchRestaurant from '../hook/useFetchRestaurant';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { set } from 'lodash';
import { formatCurrency } from '../utils/currency';
import { sendNotification } from '../services/sendNoti';

interface Props { }

const NewOrders: FC<Props> = (props) => {
    const { user } = useFetchUser();
    const { userId, token } = useSelector((state: RootState) => state.user);
    const { resId } = useSelector((state: RootState) => state.res);
    const [ restaurantId, setRestaurantId ] = useState('');
    const { orders, loading, error, refetch } = useFetchOrders('Placed', resId);
    const [ refreshing, setRefreshing ] = useState(false);
    const { updateOrderStatus } = useUpdateOrder();

    const handleSendNotification = async () => {
        await sendNotification(
            'f40cYA2JQUyKa-zmOAwDZb:APA91bESG-BmgpLhdSRzsRTMwVmjtGLELDMBwyBETG9STNeSI8LEKzYdupZ4iA4w8Y8yYixLsL5PAt4Ng0rIts4LQlItT_BO7fNWkx81ZkqN5StPKYZ93L8',
            'Preparing'
        );
    }
    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };


    const handlePreparing = async (orderId: string) => {
        await updateOrderStatus(orderId, 'Preparing');
        handleSendNotification();
        refetch();
        console.log('Preparing order:', orderId);
    };

    if (loading && !refreshing && resId) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (error) {
        return <Text>Error: {error}</Text>;
    }

    if (!orders || orders.length === 0) {
        return (
            <ScrollView refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>Không có đơn hàng</Text>
                </View>
            </ScrollView>
        );
    }

    const renderOrderItem = ({ order }: { order: Order }) => {
        return (
            <View style={styles.orderCard}>
                <View style={styles.orderHeader}>
                    <View style={styles.orderInfo}>
                        <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleString()}</Text>
                    </View>
                </View>
                <FlatList
                    data={order.orderItems}
                    keyExtractor={(item, index) => index.toString()}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                        <View key={index} style={styles.foodItem}>
                            <Image
                                source={{ uri: item.foodId.imageUrl }}
                                style={styles.foodImage}
                                resizeMode="cover"
                            />
                            <View style={styles.foodDetails}>
                                <Text style={styles.foodName}>{item.foodId.title}</Text>
                                {item.additives && <Text style={styles.foodNote}>{item.additives?.map((item) => '+ ' + item.title).join(', ')}</Text>}
                                <Text style={styles.timeInfo}>x {item.quantity} món</Text>
                                {item.instructions && <Text style={styles.foodNote}>Ghi chú: {item.instructions}</Text>}
                            </View>
                            <View style={styles.priceContainer}>
                                <Text style={styles.price}>{formatCurrency(item.price)}</Text>
                                <Text style={styles.foodNote}>{order.paymentStatus}</Text>
                            </View>
                        </View>
                    )}
                />
                <TouchableOpacity style={styles.preparingButton} onPress={() => handlePreparing(order._id)}>
                    <Icon name="progress-clock" size={20} color="#fff" />
                    <Text style={styles.preparingButtonText}>Chuẩn bị</Text>
                </TouchableOpacity>
            </View>
        )
    }

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <View style={styles.orderListContainer}>
            <FlatList
                data={orders}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (
                    renderOrderItem({ order: item })
                )}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#666666',
    },
    orderListContainer: {
        flex: 1,
    },
    listContainer: {
        padding: 12,
        gap: 12,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    orderInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    orderDate: {
        fontSize: 14,
        color: '#666',
    },
    restaurantRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    restaurantInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    verifiedIcon: {
        marginRight: 4,
    },
    restaurantName: {
        fontSize: 15,
        fontWeight: '500',
        color: '#000',
        flex: 1,
    },
    foodItem: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        gap: 12,
    },
    foodImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    foodDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    foodName: {
        fontSize: 15,
        fontWeight: '500',
        color: '#000',
        marginBottom: 2,
    },
    foodNote: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    priceContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    price: {
        fontSize: 15,
        fontWeight: '600',
        color: '#4CAF50',
        marginBottom: 4,
    },
    timeInfo: {
        fontSize: 13,
        color: '#666',
    },
    preparingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF8C00',
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    preparingButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default NewOrders;