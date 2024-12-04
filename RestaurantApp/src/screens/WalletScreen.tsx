import { FC, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import useFetchOrders from '../hook/order/useFetchOrders';
import { Order } from '../@types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatCurrency } from '../utils/currency';
import moment from 'moment';

interface Props { }

interface DailyStats {
    date: string;
    revenue: number;
    unpaid: number;
    driverFees: number;
    orderCount: number;
}

const getOrderStatusColor = (status: string) => {
    switch (status) {
        case 'Deliveried':
            return '#4CAF50';
        case 'Pending':
            return '#FF9800';
        case 'Preparing':
            return '#2196F3';
        case 'Ready':
            return '#9C27B0';
        case 'Out_for_Delivery':
            return '#3F51B5';
        default:
            return '#666666';
    }
};

const getOrderStatusText = (status: string) => {
    switch (status) {
        case 'Deliveried':
            return 'Đã giao';
        case 'Pending':
            return 'Chờ xác nhận';
        case 'Preparing':
            return 'Đang chuẩn bị';
        case 'Ready':
            return 'Sẵn sàng';
        case 'Out_for_Delivery':
            return 'Đang giao';
        default:
            return status;
    }
};

const WalletScreen: FC<Props> = () => {
    const { resId } = useSelector((state: RootState) => state.res);
    const { orders, loading, error, refetch } = useFetchOrders('All', resId);
    const [ refreshing, setRefreshing ] = useState(false);
    const [ statistics, setStatistics ] = useState({
        totalPaid: 0,
        totalUnpaid: 0,
        totalDriverFees: 0, // New field for driver earnings
        totalOrders: 0,
        paidOrders: 0,
        unpaidOrders: 0,
        completedPaidOrders: 0
    });
    const [ dailyStats, setDailyStats ] = useState<{ [ key: string ]: DailyStats }>({});
    const [ collapsedDays, setCollapsedDays ] = useState<{ [ key: string ]: boolean }>({});

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const calculateDailyStats = (orders: Order[]) => {
        return orders.reduce((acc: { [ key: string ]: DailyStats }, order) => {
            const date = moment(order.createdAt).format('YYYY-MM-DD');
            const orderTotal = order.orderItems.reduce((sum, item) => sum + item.price, 0);

            if (!acc[ date ]) {
                acc[ date ] = {
                    date,
                    revenue: 0,
                    unpaid: 0,
                    driverFees: 0,
                    orderCount: 0
                };
            }

            if (order.paymentStatus === 'Paid' ||
                (order.paymentStatus !== 'Paid' && order.orderStatus === 'Deliveried')) {
                acc[ date ].revenue += orderTotal;
            }

            if (order.paymentStatus !== 'Paid' && order.orderStatus !== 'Deliveried') {
                acc[ date ].unpaid += orderTotal;
            }

            if ((order.paymentStatus === 'Paid' && order.orderStatus === 'Out_for_Delivery') ||
                (order.paymentStatus !== 'Paid' && order.orderStatus === 'Deliveried')) {
                acc[ date ].driverFees += 5000;
            }

            acc[ date ].orderCount++;
            return acc;
        }, {});
    };

    useEffect(() => {
        if (orders) {
            const dailyStatsData = calculateDailyStats(orders);
            setDailyStats(dailyStatsData);

            // Calculate total statistics
            const totals = Object.values(dailyStatsData).reduce((acc, stat) => ({
                totalPaid: acc.totalPaid + stat.revenue,
                totalUnpaid: acc.totalUnpaid + stat.unpaid,
                totalDriverFees: acc.totalDriverFees + stat.driverFees,
                totalOrders: acc.totalOrders + stat.orderCount,
                paidOrders: acc.paidOrders + (stat.revenue > 0 ? 1 : 0),
                unpaidOrders: acc.unpaidOrders + (stat.unpaid > 0 ? 1 : 0),
                completedPaidOrders: acc.completedPaidOrders + (stat.driverFees > 0 ? 1 : 0)
            }), {
                totalPaid: 0,
                totalUnpaid: 0,
                totalDriverFees: 0,
                totalOrders: 0,
                paidOrders: 0,
                unpaidOrders: 0,
                completedPaidOrders: 0
            });

            setStatistics(totals);
        }
    }, [ orders ]);

    const renderOrderItem = ({ item }: { item: Order }) => {
        const total = item.orderItems.reduce(
            (sum, orderItem) => sum + orderItem.price,
            0
        );

        return (
            <View style={styles.orderCard}>
                <View style={styles.orderHeader}>
                    <Text style={styles.orderDate}>
                        {moment(item.createdAt).format('DD/MM/YYYY HH:mm')}
                    </Text>
                    <View style={styles.statusContainer}>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: getOrderStatusColor(item.orderStatus) }
                        ]}>
                            <Text style={styles.statusText}>
                                {getOrderStatusText(item.orderStatus)}
                            </Text>
                        </View>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: item.paymentStatus === 'Paid' ? '#4CAF50' : '#FF9800' }
                        ]}>
                            <Text style={styles.statusText}>
                                {item.paymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.orderInfo}>
                    <Text style={styles.orderAmount}>{formatCurrency(total)}</Text>
                    <Text style={styles.orderId}>#{item._id.slice(-6)}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Doanh thu</Text>
                    <Text style={styles.statValue}>{formatCurrency(statistics.totalPaid)}</Text>
                    <Text style={styles.statSubtext}>{statistics.paidOrders} đơn</Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Chưa thu</Text>
                    <Text style={[ styles.statValue, { color: '#FF9800' } ]}>
                        {formatCurrency(statistics.totalUnpaid)}
                    </Text>
                    <Text style={styles.statSubtext}>{statistics.unpaidOrders} đơn</Text>
                </View>
            </View>

            <View style={styles.driverFeesCard}>
                <Text style={styles.driverFeesLabel}>Phí giao hàng chuyển cho tài xế</Text>
                <Text style={[ styles.driverFeesValue, { color: '#2196F3' } ]}>
                    {formatCurrency(statistics.totalDriverFees)}
                </Text>
                <Text style={styles.driverFeesSubtext}>
                    ({statistics.completedPaidOrders} đơn đã hoàn thành)
                </Text>
            </View>

            <View style={styles.ordersContainer}>
                <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
                <FlatList
                    data={orders
                        ?.filter(order =>
                            order.paymentStatus === 'Paid' ||
                            (order.paymentStatus !== 'Paid' && order.orderStatus === 'Deliveried')
                        )
                        .sort((a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf())
                    }
                    renderItem={renderOrderItem}
                    keyExtractor={item => item._id}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                    contentContainerStyle={styles.listContent}
                />
            </View>

            <View style={styles.ordersContainer}>
                <Text style={styles.sectionTitle}>Thống kê theo ngày</Text>
                <FlatList
                    data={Object.values(dailyStats).sort((a, b) =>
                        moment(b.date).valueOf() - moment(a.date).valueOf()
                    )}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.dailyStatsCard}
                            onPress={() => {
                                setCollapsedDays(prev => ({
                                    ...prev,
                                    [ item.date ]: !prev[ item.date ]
                                }));
                            }}
                        >
                            <View style={styles.dailyStatsHeader}>
                                <Text style={styles.dailyStatsDate}>
                                    {moment(item.date).format('DD/MM/YYYY')}
                                </Text>
                                <Icon
                                    name={collapsedDays[ item.date ] ? 'chevron-down' : 'chevron-up'}
                                    size={24}
                                    color="#666"
                                />
                            </View>
                            {!collapsedDays[ item.date ] && (
                                <View style={styles.dailyStatsContent}>
                                    <View style={styles.dailyStatRow}>
                                        <Text style={styles.dailyStatLabel}>Doanh thu:</Text>
                                        <Text style={styles.dailyStatValue}>
                                            {formatCurrency(item.revenue)}
                                        </Text>
                                    </View>
                                    <View style={styles.dailyStatRow}>
                                        <Text style={styles.dailyStatLabel}>Chưa thu:</Text>
                                        <Text style={[ styles.dailyStatValue, { color: '#FF9800' } ]}>
                                            {formatCurrency(item.unpaid)}
                                        </Text>
                                    </View>
                                    <View style={styles.dailyStatRow}>
                                        <Text style={styles.dailyStatLabel}>Phí giao hàng:</Text>
                                        <Text style={[ styles.dailyStatValue, { color: '#2196F3' } ]}>
                                            {formatCurrency(item.driverFees)}
                                        </Text>
                                    </View>
                                    <Text style={styles.dailyOrderCount}>
                                        {item.orderCount} đơn hàng
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item.date}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            </View>
        </View>
    );
};

const additionalStyles = StyleSheet.create({
    statusContainer: {
        flexDirection: 'row',
        gap: 8
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500'
    }
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 16
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        elevation: 2
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 4
    },
    statSubtext: {
        fontSize: 12,
        color: '#999'
    },
    driverFeesCard: {
        backgroundColor: '#fff',
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        elevation: 2
    },
    driverFeesLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8
    },
    driverFeesValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4
    },
    driverFeesSubtext: {
        fontSize: 12,
        color: '#999'
    },
    ordersContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16
    },
    listContent: {
        padding: 4
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    orderDate: {
        fontSize: 14,
        color: '#666'
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500'
    },
    orderInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    orderAmount: {
        fontSize: 16,
        fontWeight: '600'
    },
    orderId: {
        fontSize: 12,
        color: '#666'
    },
    statusContainer: {
        flexDirection: 'row',
        gap: 8
    },
    dailyStatsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2
    },
    dailyStatsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    dailyStatsDate: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333'
    },
    dailyStatsContent: {
        marginTop: 12,
        gap: 8
    },
    dailyStatRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    dailyStatLabel: {
        fontSize: 14,
        color: '#666'
    },
    dailyStatValue: {
        fontSize: 16,
        fontWeight: '600'
    },
    dailyOrderCount: {
        fontSize: 12,
        color: '#999',
        marginTop: 8
    }
});

export default WalletScreen;