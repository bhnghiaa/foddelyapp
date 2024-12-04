import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Animated } from 'react-native';
import { Card, Title, Paragraph, Button, Appbar, Badge } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';
import useFetchRestaurant from '../hook/useFetchRestaurant';
import { RestaurantType } from '../@types';
import useRestaurant from '../hook/useUpdateRestaurant';

const RestaurantCard = ({ item, onVerify, onReject }: { item: RestaurantType, onVerify: (id: string) => void, onReject: (id: string) => void }) => {
    const scaleAnim = new Animated.Value(1);

    const onPressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View style={[ styles.cardContainer, { transform: [ { scale: scaleAnim } ] } ]}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
            >
                <Card style={styles.card}>
                    <View style={styles.imageContainer}>
                        <FastImage
                            source={{ uri: item.imageUrl }}
                            style={styles.cardCover}
                            resizeMode={FastImage.resizeMode.cover}
                        />
                        <Badge style={[ styles.statusBadge, styles[ `${item.verification.toLowerCase() as 'pending' | 'verified' | 'rejected'}Badge` ] ]}>
                            {item.verification}
                        </Badge>
                    </View>

                    <Card.Content style={styles.cardContent}>
                        <View style={styles.headerRow}>
                            <Title style={styles.title}>{item.title}</Title>

                        </View>

                        <View style={styles.infoRow}>
                            <Icon name="map-marker" size={16} color="#666" />
                            <Paragraph style={styles.address}>{item.coords.address}</Paragraph>
                        </View>

                        <View style={styles.buttonsContainer}>
                            <Button
                                mode="contained"
                                icon={({ size, color }) => (
                                    <Icon name="check-circle" size={size} color={color} />
                                )}
                                style={[ styles.actionButton, styles.verifyButton ]}
                                onPress={() => onVerify(item._id)}
                            >
                                Xác nhận
                            </Button>
                            <Button
                                mode="contained"
                                icon={({ size, color }) => (
                                    <Icon name="close-circle" size={size} color={color} />
                                )}
                                style={[ styles.actionButton, styles.rejectButton ]}
                                onPress={() => onReject(item._id)}
                            >
                                Từ chối
                            </Button>
                        </View>
                    </Card.Content>
                </Card>
            </TouchableOpacity>
        </Animated.View>
    );
};

// Create new TabBar component
const TabBar = ({ selectedTab, onTabChange }: { selectedTab: string, onTabChange: (tab: string) => void }) => {
    const [ tabWidth, setTabWidth ] = useState(0);
    const slideAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const index = [ 'Pending', 'Verified', 'Rejected' ].indexOf(selectedTab);
        Animated.spring(slideAnim, {
            toValue: index * tabWidth,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
        }).start();
    }, [ selectedTab, tabWidth ]);

    return (
        <View
            style={styles.tabOuterContainer}
            onLayout={({ nativeEvent }) => {
                setTabWidth(nativeEvent.layout.width / 3);
            }}
        >
            <Animated.View
                style={[
                    styles.tabIndicator,
                    {
                        width: tabWidth,
                        transform: [ { translateX: slideAnim } ],
                    }
                ]}
            />
            {[ 'Pending', 'Verified', 'Rejected' ].map((tab) => (
                <TouchableOpacity
                    key={tab}
                    style={styles.tabButton}
                    onPress={() => onTabChange(tab)}
                >
                    <Text style={[
                        styles.tabButtonText,
                        selectedTab === tab && styles.activeTabButtonText
                    ]}>
                        {tab === 'Pending' ? 'Đang chờ' :
                            tab === 'Verified' ? 'Đã xác nhận' : 'Đã từ chối'}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

// Update the Restaurant component to use new TabBar
const Restaurant = () => {
    const { restaurants, loading, error, refetch } = useFetchRestaurant();
    const [ refreshing, setRefreshing ] = useState(false);
    const [ selectedTab, setSelectedTab ] = useState('Pending');
    const { updateRestaurant } = useRestaurant();

    const onRefresh = () => {
        setRefreshing(true);
        refetch().finally(() => setRefreshing(false));
    };

    const changeVerificationStatus = async (id: string, newStatus: string) => {
        console.log('changeVerificationStatus', id, newStatus);
        // Implement the logic to change the verification status here
        await updateRestaurant(id, { verification: newStatus });
        console.log('Verification status changed to', newStatus);
        // After changing the status, you might want to refetch the data
        refetch();
    };

    const filteredRestaurants = restaurants.filter((restaurant) => restaurant.verification === selectedTab);

    const renderItem = useCallback(({ item }: { item: RestaurantType }) => (
        <RestaurantCard
            item={item}
            onVerify={(id) => changeVerificationStatus(id, 'Verified')}
            onReject={(id) => changeVerificationStatus(id, 'Rejected')}
        />
    ), []);

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />;
    }

    if (error) {
        return <Text style={styles.error}>Lỗi: {error}</Text>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>
                Nhà hàng
            </Text>
            <TabBar
                selectedTab={selectedTab}
                onTabChange={setSelectedTab}
            />
            <FlatList
                data={filteredRestaurants}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
    list: {
        paddingBottom: 16,
    },
    restaurantContainer: {
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 5
    },
    tab: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#e0e0e0',
    },
    activeTab: {
        backgroundColor: '#007bff',
    },
    tabText: {
        color: '#000',
    },
    activeTabText: {
        color: '#fff',
    },
    cardContainer: {
        margin: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    card: {
        borderRadius: 12,
        backgroundColor: '#fff',
    },
    imageContainer: {
        position: 'relative',
    },
    cardCover: {
        height: 200,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    statusBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        borderRadius: 4,
    },
    pendingBadge: {
        backgroundColor: '#FFA500',
    },
    verifiedBadge: {
        backgroundColor: '#4CAF50',
    },
    rejectedBadge: {
        backgroundColor: '#F44336',
    },
    cardContent: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        padding: 4,
        borderRadius: 4,
    },
    rating: {
        marginLeft: 4,
        fontWeight: 'bold',
        color: '#666',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    address: {
        marginLeft: 8,
        color: '#666',
        flex: 1,
    },
    description: {
        color: '#666',
        marginBottom: 16,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 4,
        borderRadius: 8,
    },
    verifyButton: {
        backgroundColor: '#4CAF50',
    },
    rejectButton: {
        backgroundColor: '#F44336',
    },
    tabOuterContainer: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        margin: 12,
        borderRadius: 12,
        height: 40,
        position: 'relative',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tabIndicator: {
        position: 'absolute',
        height: '100%',
        backgroundColor: '#2196F3',
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#2196F3',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    tabButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    tabButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        opacity: 0.8,
    },
    activeTabButtonText: {
        color: '#fff',
        fontWeight: '700',
        opacity: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4A4A4A',
        paddingTop: 8,
        paddingHorizontal: 16,
    },
});

export default Restaurant;