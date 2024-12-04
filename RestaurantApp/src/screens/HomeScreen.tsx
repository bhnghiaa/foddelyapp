import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Animated,
    Dimensions,
    Alert,
    Image,
    Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import { SharedElement } from 'react-navigation-shared-element';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Order, RootStackParamList } from '../@types';
import NewOrders from '../components/NewOrders';
import Preparing from '../components/Preparing';
import { getCurrentLocation, requestLocationPermission, reverseGeocode } from '../utils/locationUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get, set } from 'lodash';
import messaging from '@react-native-firebase/messaging';
import useFetchRestaurant from '../hook/useFetchRestaurant';
import { setResId, setProfile } from '../redux/resSlice';
import { API } from '../constants/api';
import Ready from '../components/Ready';
import Delivering from '../components/Delivering';
import Pickup from '../components/Pickup';
import Deliveried from './Deliveried';
import { COLORS } from '../constants/theme';
import useUpdateRestaurant from '../hook/useUpdateRestaurant';
import Modal from 'react-native-modal';
import useUpdateFood from '../hook/useUpdateFood';
import useFetchOrders from '../hook/order/useFetchOrders';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import notifee, { AndroidImportance } from '@notifee/react-native';

const { width } = Dimensions.get('window');
const orderTabs = [
    { label: 'Đơn hàng mới', icon: 'clipboard-list' },
    { label: 'Đang chuẩn bị', icon: 'chef-hat' },
    { label: 'Sẵn sàng', icon: 'check-circle' },
    { label: 'Đang lấy', icon: 'car' },
    { label: 'Đã lấy', icon: 'car' },
    { label: 'Đã giao', icon: 'check-circle' },
];

const createSharedAnimationConfig = () => ({
    duration: 300,
    useNativeDriver: true,
});

interface IconButtonProps {
    name: string;
    label: string;
}

// Enhanced IconButton component with new animations
const IconButton: React.FC<IconButtonProps> = ({ name, label }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const bounceAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 0.9,
                tension: 40,
                friction: 3,
                useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 40,
                friction: 5,
                useNativeDriver: true,
            }),
            Animated.spring(bounceAnim, {
                toValue: 1,
                tension: 50,
                friction: 3,
                useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start(() => {
            bounceAnim.setValue(0);
        });
    };
    const handleNav = (name: string) => {
        if (name === 'food-apple') {
            navigation.navigate('Food');
        }
        if (name === 'food') {
            navigation.navigate('UpLoadFood');
        }
        if (name === 'wallet') {
            navigation.navigate('Wallet');
        }
    }

    return (
        <TouchableOpacity onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={() => handleNav(name)} style={styles.iconButton}>
            <Animated.View style={[
                styles.iconBackground,
                {
                    transform: [
                        { scale: scaleAnim },
                        {
                            translateY: bounceAnim.interpolate({
                                inputRange: [ 0, 0.5, 1 ],
                                outputRange: [ 0, -10, 0 ]
                            })
                        }
                    ],
                    opacity: glowAnim.interpolate({
                        inputRange: [ 0, 1 ],
                        outputRange: [ 1, 0.8 ]
                    })
                }
            ]}>
                <LinearGradient
                    colors={[ '#6366F1', '#8B5CF6' ]}
                    style={styles.iconGradient}>
                    <Icon name={name} size={24} color="#fff" />
                </LinearGradient>
            </Animated.View>
            <Animated.Text style={[
                styles.iconLabel,
                {
                    transform: [ {
                        scale: scaleAnim.interpolate({
                            inputRange: [ 0.9, 1 ],
                            outputRange: [ 0.9, 1 ]
                        })
                    } ]
                }
            ]}>
                {label}
            </Animated.Text>
        </TouchableOpacity>
    );
};

interface OrderTabProps {
    label: string;
    icon: string;
    isActive: boolean;
    onPress: () => void;
}

// Enhanced OrderTab with smooth transitions
const OrderTab: React.FC<OrderTabProps> = ({ label, icon, isActive, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isActive) {
            Animated.spring(scaleAnim, {
                toValue: 1.05,
                tension: 50,
                friction: 3,
                useNativeDriver: true
            }).start();
        } else {
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 3,
                useNativeDriver: true
            }).start();
        }
    }, [ isActive ]);

    return (
        <TouchableOpacity onPress={onPress}>
            <Animated.View style={[
                styles.orderTab,
                isActive && styles.activeOrderTab,
                {
                    transform: [ { scale: scaleAnim } ]
                }
            ]}>
                <Icon
                    name={icon}
                    size={20}
                    color={isActive ? '#fff' : '#A0AEC0'}
                />
                <Text style={[
                    styles.orderTabText,
                    isActive && styles.activeOrderTabText
                ]}>
                    {label}
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const [ activeTab, setActiveTab ] = useState('Đơn hàng mới');
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const { username, email, userId, token } = useSelector((state: RootState) => state.user);
    const { resId, profile } = useSelector((state: RootState) => state.res);
    const { restaurant, loading: fetchLoading, error: fetchError } = useFetchRestaurant();
    const [ userAddress, setUserAddress ] = useState('');
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { updateRestaurantAvailability } = useUpdateRestaurant();
    const { updateFoodAvailabilityByRestaurant } = useUpdateFood();
    const dispatch = useDispatch();
    const [ isAvailable, setIsAvailable ] = useState(true);
    const fcmToken = "dj5wrlEXQGOXJ5gcDYasWi:APA91bEMbWYNWEqaiOlBe4MnClhjE4yIFTdCNVLezSWhEda_5OBmTtE6gHrGc1GaMNhoq9M6NKS41Y-KFpbdogbreZiIfz5Zbe3ncQP30-ySeZkt7xSgxOs"
    const [ statusAnimation ] = useState(new Animated.Value(0));
    const [ isAlertVisible, setAlertVisible ] = useState(false);
    const [ filterOrders, setFilterOrders ] = useState<Order[]>();
    const { orders, loading, error, refetch } = useFetchOrders('All', resId);
    useEffect(() => {
        refetch();
        if (orders) {
            const filteredOrders = orders.filter(order => order.orderStatus !== 'Deliveried');
            setFilterOrders(filteredOrders);
        }
    }, [ activeTab ]);
    const toggleStatus = () => {
        if (isAvailable) {
            if (filterOrders && filterOrders.length > 0) {
                Alert.alert("Thông báo", "Không thể đóng cửa hàng khi đang có đơn hàng.");
                return;
            }
        }
        setAlertVisible(true);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const handleConfirm = async () => {
        setAlertVisible(false);
        Animated.sequence([
            Animated.spring(statusAnimation, {
                toValue: isAvailable ? 0 : 1,
                useNativeDriver: true,
                friction: 8,
            })
        ]).start();
        await updateRestaurantAvailability(!isAvailable);
        await updateFoodAvailabilityByRestaurant(!isAvailable);
        setIsAvailable(!isAvailable);
    };

    const handleTabPress = (tab: string) => {
        setActiveTab(tab);
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start();
    };

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
    }, []);

    useEffect(() => {
        if (restaurant) {
            dispatch(setResId(restaurant._id));
            dispatch(setProfile(restaurant.logoUrl));
            setIsAvailable(restaurant.isAvailable);
        }
    }, [ restaurant ]);



    useEffect(() => {
        const registerTokenToServer = async () => {
            try {
                // Lấy FCM Token của Restaurant
                const token = await messaging().getToken();
                console.log('Restaurant FCM Token:', token);

                // Gửi token của Restaurant lên server
                await axios.post(`${API}/register-restaurant-token`, { token });
            } catch (error) {
                console.log('Lỗi khi lấy token hoặc gửi token lên server:', error);
            }
        };
        registerTokenToServer();
    }, []);

    // Create notification channel
    const createNotificationChannel = async () => {
        await notifee.createChannel({
            id: 'default',
            name: 'Default Channel',
            importance: AndroidImportance.HIGH,
            sound: 'default',
        });
    };

    // Display foreground notification
    const onDisplayNotification = async (title: string, body: string) => {
        await notifee.displayNotification({
            title,
            body,
            android: {
                channelId: 'default',
                smallIcon: 'ic_launcher',
                pressAction: {
                    id: 'default',
                },
                sound: 'default',
            },
        });
    };

    useEffect(() => {
        // Request permissions
        const requestUserPermission = async () => {
            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            if (enabled) {
                console.log('Authorization status:', authStatus);
            }
        };

        // Create channel and request permissions
        const init = async () => {
            await createNotificationChannel();
            await requestUserPermission();
        };

        init();

        // Foreground message handler
        const unsubscribe = messaging().onMessage(async remoteMessage => {
            console.log('Foreground Message:', remoteMessage);

            await onDisplayNotification(
                remoteMessage.notification?.title || 'New Order',
                remoteMessage.notification?.body || 'You have a new order!'
            );

            // Refresh orders list
            refetch();
        });

        // Background message handler
        messaging().setBackgroundMessageHandler(async remoteMessage => {
            console.log('Background Message:', remoteMessage);

            if (remoteMessage.data?.type === 'new_order') {
                // Will be called when app is in background
                refetch();
            }
        });

        // Handle notification open events
        messaging().onNotificationOpenedApp(remoteMessage => {
            console.log('Notification opened app:', remoteMessage);

            if (remoteMessage.data?.type === 'new_order') {
                setActiveTab('Đơn hàng mới');
            }
        });

        // Check if app was opened from notification
        messaging().getInitialNotification().then(remoteMessage => {
            if (remoteMessage) {
                console.log('Initial notification:', remoteMessage);
                setActiveTab('Đơn hàng mới');
            }
        });

        // Token refresh handler
        messaging().onTokenRefresh(token => {
            // Send token to backend
            axios.post(`${API}/register-restaurant-token`, { token });
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <SafeAreaView style={[ styles.container, { paddingTop: insets.top } ]}>
            <StatusBar barStyle="dark-content" />
            <HeaderBackground />
            <View style={styles.header}>
                <TouchableOpacity style={styles.userInfo} onPress={() => navigation.navigate("Profile")}>
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
                    <Text style={styles.usernameText}>{username}</Text>
                </TouchableOpacity>

                <View style={styles.statusSection}>
                    <Switch
                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                        thumbColor={isAvailable ? '#4CAF50' : '#f4f3f4'}
                        onValueChange={toggleStatus}
                        value={isAvailable}
                        style={styles.switch}
                    />

                    <Animated.Text
                        style={[
                            styles.statusText,
                            {
                                color: isAvailable ? '#4CAF50' : '#ff4444',
                                transform: [ {
                                    scale: statusAnimation.interpolate({
                                        inputRange: [ 0, 0.5, 1 ],
                                        outputRange: [ 1, 1.1, 1 ]
                                    })
                                } ]
                            }
                        ]}
                    >
                        {isAvailable ? 'Open' : 'Closed'}
                    </Animated.Text>
                </View>
            </View>

            <View style={styles.iconButtonContainer}>
                <IconButton name="food" label="Thêm món ăn" />
                <IconButton name="wallet" label="Ví tiền" />
                <IconButton name="food-apple" label="Các món ăn" />
            </View>

            <View style={styles.orderTabs}>
                <FlatList
                    data={orderTabs}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.label}
                    renderItem={({ item }) => (
                        <OrderTab
                            label={item.label}
                            icon={item.icon}
                            isActive={activeTab === item.label}
                            onPress={() => handleTabPress(item.label)}
                        />
                    )}
                />
            </View>

            <Animated.View style={[ styles.content, { opacity: fadeAnim } ]}>
                {activeTab === 'Đơn hàng mới' && <NewOrders />}
                {activeTab === 'Đang chuẩn bị' && <Preparing />}
                {activeTab === 'Sẵn sàng' && <Ready />}
                {activeTab === 'Đang lấy' && <Pickup />}
                {activeTab === 'Đã lấy' && <Delivering />}
                {activeTab === 'Đã giao' && <Deliveried />}
            </Animated.View>

            <Modal
                isVisible={isAlertVisible}
                onBackdropPress={() => setAlertVisible(false)}
                backdropOpacity={0.5}
                animationIn="fadeIn"
                animationOut="fadeOut"
                useNativeDriver
                style={styles.modalContainer}
            >
                <Animated.View
                    style={[
                        styles.alertContainer,
                        {
                            opacity: fadeAnim,
                            transform: [ {
                                scale: fadeAnim.interpolate({
                                    inputRange: [ 0, 1 ],
                                    outputRange: [ 0.9, 1 ]
                                })
                            } ]
                        }
                    ]}
                >
                    <View style={styles.alertIconContainer}>
                        <Icon
                            name={isAvailable ? "store-off" : "store"}
                            size={40}
                            color={isAvailable ? "#f44336" : "#4CAF50"}
                        />
                    </View>

                    <Text style={styles.alertTitle}>
                        {isAvailable ? 'Đóng cửa hàng?' : 'Mở cửa hàng?'}
                    </Text>

                    <Text style={styles.alertMessage}>
                        {isAvailable
                            ? 'Bạn sẽ ngừng nhận đơn hàng mới'
                            : 'Bạn sẽ bắt đầu hoạt động'}
                    </Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[ styles.button, styles.cancelButton ]}
                            onPress={() => setAlertVisible(false)}
                        >
                            <Text style={styles.buttonText}>Hủy</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[ styles.button, styles.confirmButton ]}
                            onPress={handleConfirm}
                        >
                            <Text style={[ styles.buttonText, { color: '#fff' } ]}>Xác nhận</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7FAFC'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        marginBottom: 16,
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
    },
    headerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 120,
    },
    iconGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
    },
    iconBackground: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'transparent',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2D3748',
    },
    subtitle: {
        fontSize: 14,
        color: '#ffffff',
    },
    openBadge: {
        backgroundColor: '#48BB78',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    openText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold'
    },
    iconButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        marginHorizontal: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    iconButton: {
        alignItems: 'center',
        marginHorizontal: 8,
    },
    iconLabel: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: '500',
        color: '#4A5568',
    },
    orderTabs: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
    },
    orderTab: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginHorizontal: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        marginVertical: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    activeOrderTab: {
        backgroundColor: '#6366F1',
        transform: [ { scale: 1.05 } ],
    },
    orderTabText: {
        color: '#4A5568',
        fontWeight: '500',
        marginLeft: 5
    },
    activeOrderTabText: {
        color: '#fff',
        fontWeight: '600',
    },
    content: {
        flex: 1,
        borderRadius: 20,
        margin: 16,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        overflow: 'hidden'
    },
    placeholderText: {
        fontSize: 16,
        color: '#4A5568',
        textAlign: 'center'
    },
    profileButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginLeft: 16,
    },
    cart: {
        backgroundColor: 'red',

    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    profileContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        flexDirection: 'column',
    },
    usernameText: {
        fontSize: 18,
        fontWeight: '500',
        color: COLORS.white,
    },
    statusSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 8,
    },
    statusIndicator: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    switch: {
        transform: [ { scaleX: 0.8 }, { scaleY: 0.8 } ]
    },
    modalContainer: {
        margin: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        width: '80%',
        alignItems: 'center',
        elevation: 5,
    },
    alertIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    alertTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    alertMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        minWidth: 100,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

const HeaderBackground = () => (
    <LinearGradient
        colors={[ '#6366F1', '#8B5CF6' ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerBackground}
    />
);
