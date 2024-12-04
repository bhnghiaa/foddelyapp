// HomeScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Animated, FlatList, RefreshControl, Alert, PermissionsAndroid, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import CategoryItem from '../components/CategoryItem';
import RestaurantCard from '../components/RestaurantCard';
import useFetchCategories from '../hook/category/categoryHook';
import FoodItem from '../components/FoodItem';
import useFetchNearByRestaurant from '../hook/restaurant/nearByRestaurant';
import useFetchRecommendFood from '../hook/food/recommendFood';
import HorizontalShimmer from '../components/Shimmers/HorizontalShimmer';
import { COLORS, SIZES } from '../constants/theme';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import Octicons from 'react-native-vector-icons/Octicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import useFetchUser from '../hook/user/useFetchUser';
import useFoodsByCategory from '../hook/food/useFoodsByCategory';
import VerticalShimmer from '../components/Shimmers/VerticalShimmer';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Location, RootStackParamList } from '../@types';
import messaging from '@react-native-firebase/messaging';
import GetLocation from 'react-native-get-location';
import { calculateDistance, calculateTravelTime, getCurrentLocation, requestLocationPermission, reverseGeocode } from '../utils/locationUtils';
import { API_LOCATION } from '../constants/api';
import { setAddress, setLocation } from '../redux/locationSlice';
import { useAddress, useUserLocation } from '../hook/location/useFetchLocation';
import useGetReview from '../hook/rating/useGetReview';

const HomeScreen: React.FC = () => {
    const animatedValue = new Animated.Value(0);
    const [ selectedCategoryId, setSelectedCategoryId ] = useState<string | null>(null);
    const { categories, loading, error, refetch: refetchCategories } = useFetchCategories();
    const { restaurants, loading: loadingRestaurant, error: errorRestaurant, refetch: refetchRestaurants } = useFetchNearByRestaurant('100000');
    const { foods, loading: loadingFood, error: errorFood, refetch: refetchFoods } = useFetchRecommendFood('helo');
    const { category, loading: loadingCategory, error: errorCategory, refetch: refetchCategory } = useFoodsByCategory(selectedCategoryId ?? 'all');
    const { email, profile, userId, token } = useSelector((state: RootState) => state.user);
    const [ refreshing, setRefreshing ] = useState(false);
    const { userCoords, loading: locationLoading, refetch: refetchLocation, fetchLocation } = useUserLocation();
    const { address, loading: addressLoading, refetch: refetchAddress, fetchAddress } = useAddress();
    const [ distance, setDistance ] = useState<number | null>(null);

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const dispatch = useDispatch();
    useEffect(() => {
        if (selectedCategoryId) {
            refetchCategory();
        }
    }, [ selectedCategoryId ]);

    useEffect(() => {
        if (address) {
            dispatch(setAddress(address));
        }
        if (userCoords) {
            dispatch(setLocation(userCoords));
        }
    }, [ userCoords, address ]);

    useEffect(() => {
        const initializeLocation = async () => {
            const coords = await fetchLocation();
            if (coords) {
                await fetchAddress(coords);
                // await fetchNearbyRestaurants(coords);
            }
        };

        initializeLocation();
    }, [ refreshing ]);
    const handleCategoryPress = (categoryId: string) => {
        setSelectedCategoryId(categoryId);
        if (selectedCategoryId === categoryId) {
            setSelectedCategoryId(null);
        } else {
            setSelectedCategoryId(categoryId);
        }
        refetchCategory();
    };


    const onRefresh = () => {

        setRefreshing(true);
        setSelectedCategoryId(null);
        if (userCoords) {
            refetchAddress(userCoords);
        }
        // Gọi lại các API khi refresh
        Promise.all([ refetchCategories(), refetchRestaurants(), refetchFoods(), refetchCategory(), refetchLocation() ])
            .finally(() => setRefreshing(false));
    };


    const fadeIn = () => {
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    };

    React.useEffect(() => {
        fadeIn();

    }, []);

    const handleNavCart = () => {
        if (userId) {
            navigation.navigate('Cart');
        }
        else {
            Alert.alert(
                'Thông báo',
                'Vui lòng đăng nhập để xem giỏ hàng!',
                [
                    { text: 'Hủy', style: 'cancel' },
                    { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
                ]
            );
        }
    }

    useEffect(() => {
        if (userId) {
        }
    }, [ userId ]);

    useEffect(() => {
        const getFCMToken = async () => {
            const fcmToken = await messaging().getToken();
            if (fcmToken) {
                console.log('FCM Token:', fcmToken);
                return fcmToken;
            }
        }
        getFCMToken();
    }, [])

    const sortedRestaurants = useMemo(() => {
        return [ ...restaurants ].sort((a, b) => {
            const distanceA = userCoords ? calculateDistance(userCoords, a.coords) : Infinity;
            const distanceB = userCoords ? calculateDistance(userCoords, b.coords) : Infinity;
            return distanceA - distanceB;
        });
    }, [ restaurants, userCoords, refreshing ]);
    const sortedRating = useMemo(() => {
        return [ ...restaurants ].sort((a, b) => {
            return b.ratings - a.ratings;
        });
    }, [ restaurants, refreshing ]);


    return (
        <ScrollView style={styles.container}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            <Animated.View style={[ styles.header, { opacity: 1 } ]}>
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
                        <Text style={styles.deliveryText}>Giao hàng</Text>
                        {refreshing || locationLoading ? <Text style={styles.address}>Đang cập nhật địa chỉ</Text> : <Text style={styles.address}>{address ? address : "Đang cập nhật địa chỉ"}</Text>}
                    </View>
                </View>

                <TouchableOpacity onPress={() => handleNavCart()} style={styles.cart}>
                    <MaterialIcons name="shopping-cart" size={24} color="#20B2AA" />
                </TouchableOpacity>

            </Animated.View>

            {loading ? (
                <HorizontalShimmer
                    width={40}
                    height={40} marginRight={10} radius={20} />
            ) : (
                <FlatList
                    data={categories}
                    keyExtractor={item => item._id.toString()}
                    horizontal
                    style={styles.categories}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <CategoryItem
                            name={item.title}
                            image={item.imageUrl}
                            isSelected={item._id === selectedCategoryId}
                            onPress={() => handleCategoryPress(item._id)}
                        />
                    )}
                />
            )}
            {selectedCategoryId === null ? (
                <View>
                    <View style={styles.section}>
                        <View style={styles.row}>
                            <Text style={styles.sectionTitle}>Quán ăn gần bạn</Text>
                            <TouchableOpacity>
                                <AntDesign name='appstore1' size={20} color='#20B2AA' />
                            </TouchableOpacity>
                        </View>
                        {loadingRestaurant || !userCoords ? (
                            <HorizontalShimmer
                                width={SIZES.width - 110}
                                height={120} marginRight={10} radius={20} />
                        ) : (
                            <FlatList
                                data={sortedRestaurants}
                                keyExtractor={item => item._id.toString()}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                renderItem={({ item, index }) => {
                                    // const routes = await getRoutes(start, end);

                                    const distance = calculateDistance(userCoords, item.coords);
                                    const travelTime = calculateTravelTime(distance);
                                    return (
                                        <RestaurantCard
                                            item={item}
                                            distance={distance}
                                            travelTime={travelTime}
                                        />
                                    );
                                }}
                            />
                        )}
                    </View>
                    <View style={styles.section}>
                        <View style={styles.row}>
                            <Text style={styles.sectionTitle}>Top quán ăn rating 5*</Text>
                            <TouchableOpacity >
                                <AntDesign name='appstore1' size={20} color='#20B2AA' />
                            </TouchableOpacity>
                        </View>
                        {loadingRestaurant || !userCoords ? (
                            <HorizontalShimmer
                                width={SIZES.width - 110}
                                height={120} marginRight={10} radius={20} />
                        ) : (
                            <FlatList
                                data={sortedRating}
                                keyExtractor={item => item._id.toString()}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                renderItem={({ item, index }) => {
                                    const distance = calculateDistance(userCoords, item.coords);
                                    const travelTime = calculateTravelTime(distance);
                                    return (
                                        <RestaurantCard
                                            item={item}
                                            distance={distance}
                                            travelTime={travelTime}
                                        />
                                    );
                                }}
                            />
                        )}
                    </View>

                    <View style={styles.section}>
                        <View style={styles.row}>
                            <Text style={styles.sectionTitle}>Thử các món mới</Text>
                            <TouchableOpacity >
                                <AntDesign name='appstore1' size={20} color='#20B2AA' />
                            </TouchableOpacity>
                        </View>
                        {loadingFood ? (
                            <HorizontalShimmer
                                width={SIZES.width - 110}
                                height={110} marginRight={10} radius={20} />
                        ) : (
                            <FlatList
                                data={foods}
                                keyExtractor={item => item._id.toString()}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <FoodItem
                                        item={item}
                                    />
                                )}
                            />
                        )}

                    </View>

                </View>
            ) : (
                <View>
                    {loadingCategory || !userCoords ? (
                        <VerticalShimmer
                            width={SIZES.width - 110}
                            height={110} radius={20} />
                    ) : (
                        category.map(item => (
                            <FoodItem
                                key={item._id.toString()}
                                item={item}
                            />
                        ))
                    )}
                </View>
            )}

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
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
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        maxWidth: '75%',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
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
    categories: {
        padding: 16,
        backgroundColor: '#fff',
        marginBottom: 8,
    },
    section: {
        paddingVertical: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#20B2AA',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 8,
    },
    username: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    cart: {
    },
});

export default HomeScreen;
