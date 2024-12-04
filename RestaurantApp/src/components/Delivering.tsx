import { FC, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, FlatList, Image, TouchableOpacity, ActivityIndicator, Button } from 'react-native';
import useFetchUser from '../hook/useFetchUser';
import useFetchOrders from '../hook/order/useFetchOrders';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Order, OrderItem } from '../@types';
import useUpdateOrder from '../hook/order/useUpdateOrder';
import useFetchRestaurant from '../hook/useFetchRestaurant';
import { set } from 'lodash';
import { formatCurrency } from '../utils/currency';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants/theme';
interface Props { }

const Delivering: FC<Props> = (props) => {
    const { resId } = useSelector((state: RootState) => state.res);
    const { orders, loading, error, refetch } = useFetchOrders('Out_for_Delivery', resId);
    const [ refreshing, setRefreshing ] = useState(false);
    const { updateOrderStatus } = useUpdateOrder();
    const deliveryFee = 5000;
    const dispatch = useDispatch();
    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };


    const handleReady = async (orderId: string) => {
        // await updateOrderStatus(orderId, 'Out_for_Delivery');
        refetch();
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
                    <Text style={styles.emptyStateText}>Không có đơn hàng đã lấy</Text>
                </View>
            </ScrollView>
        );
    }

    const renderOrderItem = ({ order }: { order: Order }) => {
        let totalAmount = 0;
        order.orderItems.forEach((orderItem: OrderItem) => {
            totalAmount += orderItem.price;
        });
        return (
            <View style={styles.orderCard}>
                <TouchableOpacity style={styles.restaurantRow}>
                    <View style={styles.restaurantInfo}>
                        <Icon name="check-decagram" size={16} color="#FF8C00" style={styles.verifiedIcon} />
                        <Text style={styles.restaurantName} numberOfLines={1}>
                            {order.restaurantId.title}
                        </Text>
                    </View>
                    <Text style={styles.foodNote}>#{order._id.slice(-6)}</Text>

                </TouchableOpacity>

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
                            </View>
                        </View>
                    )}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                    <Text style={styles.summaryLabel}>Phí giao hàng:</Text>
                    <Text style={styles.itemPrice}>{formatCurrency(deliveryFee)}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
                    <Text style={styles.summaryLabel}>Hình thức thanh toán:</Text>
                    <Text style={[ styles.summaryLabel, { color: '#FF8C00' } ]}>{order.paymentMethod}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.totalLabel}>Tổng:</Text>
                    <Text style={styles.totalValue}>{formatCurrency(totalAmount + deliveryFee)}</Text>
                </View>
                <TouchableOpacity style={styles.preparingButton} onPress={() => handleReady(order._id)}>
                    <Text style={styles.preparingButtonText}>Xem thông tin người giao hàng</Text>
                    <MaterialIcons name="delivery-dining" size={22} color={COLORS.lightWhite} />
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
        backgroundColor: '#4CAF50',
        paddingVertical: 8,
        borderRadius: 8,
        marginTop: 10,
        gap: 8
    },
    preparingButtonText: {
        color: COLORS.lightWhite,
        fontSize: 16,
        fontWeight: '600',
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4CAF50',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4CAF50',
    },
});

export default Delivering;