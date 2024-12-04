import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    useWindowDimensions,
    ActivityIndicator,
    RefreshControl,
    FlatList,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import useFetchOrders from '../hook/order/useFetchOrders';
import { RootStackParamList, Order, FoodItems, OrderItem } from '../@types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatCurrency } from '../utils/currency';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants/theme';

const OrderList = ({ paymentStatus, orderStatus }: { paymentStatus?: string, orderStatus: string }) => {
    const { orders, loading, error, refetch } = useFetchOrders(paymentStatus ?? '', orderStatus);
    const filteredOrders = (orders ?? []).filter(order => order.paymentStatus === paymentStatus || order.orderStatus === orderStatus);
    const deliveryFee = 5000;
    const [ refreshing, setRefreshing ] = useState(false);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    useEffect(() => {
        setRefreshing(true);
        refetch();
        setRefreshing(false);
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    if (loading && !refreshing) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (error) {
        return <Text style={styles.emptyState}>Bạn chưa có đơn hàng</Text>;
    }

    if (filteredOrders.length === 0) {
        return (
            <ScrollView refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>Không có đơn hàng nào</Text>
                </View>
            </ScrollView>
        );
    }
    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }
    const handleCheckInfo = (order: Order) => {
        navigation.navigate('Location', { driverId: order.driverId._id, address: order.restaurantAddress });
        console.log(order.driverId._id);
    }
    const renderOrderItem = ({ item }: { item: Order }) => {
        let totalAmount = 0;
        item.orderItems.forEach((orderItem: OrderItem) => {
            totalAmount += orderItem.price;
        });
        return (
            <View style={styles.orderCard}>
                <View style={styles.orderHeader}>
                    <View style={styles.orderInfo}>
                        <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleString()}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.restaurantRow}>
                    <View style={styles.restaurantInfo}>
                        <Icon name="check-decagram" size={16} color="#FF8C00" style={styles.verifiedIcon} />
                        <Text style={styles.restaurantName} numberOfLines={1}>
                            {item.restaurantId.title}
                        </Text>
                    </View>
                    <Text style={styles.foodNote}>#{item._id.slice(-6)}</Text>

                </TouchableOpacity>

                <FlatList
                    data={item.orderItems}
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
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.totalLabel}>Tổng:</Text>
                    <Text style={styles.totalValue}>{formatCurrency(totalAmount + deliveryFee)}</Text>
                </View>
                {orderStatus === 'Out_for_Delivery' && (
                    <TouchableOpacity style={styles.preparingButton} onPress={() => handleCheckInfo(item)}>
                        <Text style={styles.preparingButtonText}>Xem thông tin người giao hàng</Text>
                        <MaterialIcons name="delivery-dining" size={22} color={COLORS.lightWhite} />
                    </TouchableOpacity>
                )}
            </View>
        )
    }

    return (
        <View style={styles.orderListContainer}>
            <FlatList
                data={filteredOrders}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (
                    renderOrderItem({ item })
                )}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
};

const renderScene = SceneMap({
    pending: () => <OrderList paymentStatus="Pending" orderStatus="Placed" />,
    paid: () => <OrderList paymentStatus="Paid" orderStatus="Placed" />,
    preparing: () => <OrderList orderStatus="Preparing" />,
    ready: () => <OrderList orderStatus="Ready" />,
    delivering: () => <OrderList orderStatus="Out_for_Delivery" />,
    deliveried: () => <OrderList orderStatus="Deliveried" />,
});

export default function OrdersScreen() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const layout = useWindowDimensions();
    const [ index, setIndex ] = useState(0);
    const [ routes ] = useState([
        { key: 'pending', title: 'Đang chờ' },
        { key: 'paid', title: 'Đã thanh toán' },
        { key: 'preparing', title: 'Đang chuẩn bị' },
        { key: 'ready', title: 'Đang chờ giao hàng' },
        { key: 'delivering', title: 'Đang giao hàng' },
        { key: 'deliveried', title: 'Đã giao hàng' },
    ]);
    const { orders, loading, error, refetch } = useFetchOrders('', 'Placed');


    const renderTabBar = (props: any) => (
        <TabBar
            {...props}
            scrollEnabled
            style={styles.tabBar}
            indicatorStyle={styles.indicator}
            tabStyle={styles.tab}
            labelStyle={styles.tabLabel}
            activeColor="#4CAF50"
            inactiveColor="#666666"
        />
    );
    useEffect(() => {
        refetch();
    }, []);
    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }
    return (
        <SafeAreaView style={styles.container} >
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Đơn hàng</Text>
            </View>

            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
                renderTabBar={renderTabBar}
                style={styles.tabView}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
    },
    tabView: {
        flex: 1,
    },
    tabBar: {
        backgroundColor: '#ffffff',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    indicator: {
        backgroundColor: '#4CAF50',
        height: 3,
    },
    tab: {
        width: 'auto',
        paddingHorizontal: 16,
    },
    tabLabel: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'none',
    },
    orderList: {
        flex: 1,
        padding: 16,
    },
    orderItem: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        elevation: 2,
        alignContent: 'center',
        justifyContent: 'space-between',
    },
    orderImage: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    orderDetails: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    orderName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 4,
    },
    deliveryTime: {
        fontSize: 14,
        color: '#666666',
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
        padding: 8,
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
    orderId: {
        fontSize: 14,
        color: '#666',
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
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 14,
        color: '#666',
    },
    reorderButton: {
        backgroundColor: '#EE4D2D',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
    },
    reorderButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
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
});