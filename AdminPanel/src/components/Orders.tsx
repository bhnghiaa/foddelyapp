// Orders.tsx
import React, { useRef, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Animated, SectionList, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import useFetchOrders from '../hook/useFetchOrders';
import { Order } from '../@types';
import { formatCurrency } from '../utils/currency';

const OrderCard = ({ item, index }: { item: Order; index: number }) => {
    const translateY = useRef(new Animated.Value(50)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 0,
                duration: 500,
                delay: index * 150,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 400,
                delay: index * 150,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const statusStyles = {
        'Pending': { bg: '#FFF4E5', color: '#FF9800', icon: 'clock' },
        'Processing': { bg: '#E3F2FD', color: '#2196F3', icon: 'refresh' },
        'Completed': { bg: '#E8F5E9', color: '#4CAF50', icon: 'check-circle' }
    }[ item.orderStatus ] || { bg: '#F5F5F5', color: '#9E9E9E', icon: 'info-circle' };

    return (
        <Animated.View style={[
            styles.card,
            {
                opacity,
                transform: [ { translateY } ]
            }
        ]}>
            <View style={styles.cardTop}>
                <View style={styles.headerRow}>
                    <View style={[ styles.badge, { backgroundColor: statusStyles.bg } ]}>
                        <Icon name={statusStyles.icon} size={12} color={statusStyles.color} />
                        <Text style={[ styles.badgeText, { color: statusStyles.color } ]}>
                            {item.orderStatus}
                        </Text>
                    </View>
                    <Text style={styles.orderId}>#{item._id.slice(-6)}</Text>
                </View>

                <View style={styles.restaurantInfo}>
                    <MaterialIcons name="restaurant" size={18} color="#757575" />
                    <Text style={styles.restaurantName}>{item.restaurantId.title}</Text>
                </View>
            </View>

            <View style={styles.itemsList}>
                {item.orderItems.map((orderItem, idx) => (
                    <View key={idx} style={styles.itemRow}>
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemQuantity}>{orderItem.quantity}×</Text>
                            <Text style={styles.itemName}>{orderItem.foodId.title}</Text>
                        </View>
                        <Text style={styles.itemPrice}>
                            {formatCurrency(orderItem.foodId.price * orderItem.quantity)}
                        </Text>
                    </View>
                ))}
            </View>

            <View style={styles.cardBottom}>
                <View style={styles.customerInfo}>
                    {item.userId && item.userId.profile ? (
                        <Image source={{ uri: item.userId.profile }} style={styles.customerAvatar} />
                    ) : (
                        <View style={styles.defaultAvatar}>
                            <MaterialIcons name="person" size={24} color="#fff" />
                        </View>
                    )}
                    <Text style={styles.customerName}>{item.userId?.username || 'Người dùng'}</Text>
                </View>

                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Tổng</Text>
                    <Text style={styles.totalAmount}>{formatCurrency(item.orderTotal)}</Text>
                </View>
            </View>
        </Animated.View>
    );
};

const Orders = () => {
    const { orderByAdmin } = useFetchOrders();
    const [ expandedSections, setExpandedSections ] = useState<string[]>([]);

    const groupedOrders = useMemo(() => {
        if (!orderByAdmin) return [];

        const groups = orderByAdmin.reduce((acc, order) => {
            const status = order.orderStatus;
            if (!acc[ status ]) {
                acc[ status ] = [];
            }
            acc[ status ].push(order);
            return acc;
        }, {} as Record<string, Order[]>);

        return Object.entries(groups).map(([ status, data ]) => ({
            title: status,
            data
        }));
    }, [ orderByAdmin ]);

    const toggleSection = (sectionTitle: string) => {
        setExpandedSections(prev =>
            prev.includes(sectionTitle)
                ? prev.filter(title => title !== sectionTitle)
                : [ ...prev, sectionTitle ]
        );
    };

    const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => {
        const statusConfig = {
            'Pending': { color: '#FF9800', label: 'Đang chờ' },
            'Processing': { color: '#2196F3', label: 'Đang xử lý' },
            'Completed': { color: '#4CAF50', label: 'Hoàn thành' }
        }[ title ] || { color: '#666', label: title };

        const isExpanded = expandedSections.includes(title);

        return (
            <TouchableOpacity
                style={[ styles.sectionHeader, { borderLeftColor: statusConfig.color } ]}
                onPress={() => toggleSection(title)}
            >
                <View style={styles.sectionHeaderContent}>
                    <Text style={styles.sectionHeaderText}>{statusConfig.label}</Text>
                    <Text style={styles.sectionCount}>
                        {groupedOrders.find(group => group.title === title)?.data.length || 0} đơn
                    </Text>
                </View>
                <MaterialIcons
                    name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={24}
                    color="#666"
                />
            </TouchableOpacity>
        );
    };

    const renderItem = ({ item, index, section }: { item: Order; index: number; section: { title: string } }) => {
        const isExpanded = expandedSections.includes(section.title);
        if (!isExpanded) return null;
        return <OrderCard item={item} index={index} />;
    };

    return (
        <View style={styles.container}>
            <SectionList
                sections={groupedOrders}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                contentContainerStyle={styles.listContainer}
                stickySectionHeadersEnabled
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#F5F7FA',
    },
    listContainer: {
        paddingTop: 8,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        margin: 8,
    },
    cardTop: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    orderId: {
        fontSize: 14,
        fontWeight: '700',
        color: '#424242',
    },
    restaurantInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    restaurantName: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '500',
        color: '#212121',
    },
    itemsList: {
        padding: 16,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    itemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemQuantity: {
        fontSize: 14,
        fontWeight: '600',
        color: '#757575',
        marginRight: 8,
    },
    itemName: {
        fontSize: 14,
        color: '#424242',
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#212121',
    },
    cardBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FAFAFA',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    customerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    customerAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
    },
    defaultAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#9E9E9E',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    customerName: {
        fontSize: 14,
        color: '#616161',
    },
    totalContainer: {
        alignItems: 'flex-end',
    },
    totalLabel: {
        fontSize: 12,
        color: '#757575',
        marginBottom: 2,
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#212121',
    },
    sectionHeader: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 8,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderLeftWidth: 4,
        // marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionHeaderText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    sectionCount: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    sectionHeaderContent: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
    }
});

export default Orders;