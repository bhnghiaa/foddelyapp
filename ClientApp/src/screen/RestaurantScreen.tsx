import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Dimensions,
    Easing,
    Platform,
    Alert,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { FoodItems, RootStackParamList } from '../@types';
import { COLORS } from '../constants/theme';
import StarRating from 'react-native-star-rating-widget';
import useFetchFoodsByRestaurant from '../hook/food/useFetchFoodsByRestaurant';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import useFetchUser from '../hook/user/useFetchUser';
import { formatTime } from '../utils/locationUtils';
import useGetReview from '../hook/rating/useGetReview';
const { width, height } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = height * 0.4;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 90 : 70;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;


interface MenuItemProps {
    index: number;
    name: string;
    price: number;
    deliveryTime: string;
    image: string;
    ingredients: string[];
    food: FoodItems;
}

const MenuItem = ({ index, name, price, deliveryTime, image, ingredients, food }: MenuItemProps) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            delay: index * 200,
            useNativeDriver: true,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }).start();
    }, []);

    const translateX = animatedValue.interpolate({
        inputRange: [ 0, 1 ],
        outputRange: [ width, 0 ],
    });

    const opacity = animatedValue.interpolate({
        inputRange: [ 0, 0.5, 1 ],
        outputRange: [ 0, 0.5, 1 ],
    });
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    return (
        <TouchableOpacity onPress={() => navigation.navigate('Food', { food: food })}>
            <Animated.View style={[ styles.menuItem, { opacity, transform: [ { translateX } ] } ]}>
                <Image source={{ uri: image }} style={styles.menuItemImage} />
                <View style={styles.menuItemDetails}>
                    <Text style={styles.menuItemName}>{name}</Text>
                    <Text style={styles.menuItemDelivery}>Thời gian chuẩn bị: {deliveryTime} min</Text>
                    <Text style={styles.menuItemIngredients}>{ingredients.join(', ')}</Text>
                </View>
                <Text style={styles.menuItemPrice}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}</Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

const RestaurantScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'Restaurant'>>();
    const restaurant = route.params.restaurant;
    const { fbr, loading, error, refetch } = useFetchFoodsByRestaurant(restaurant._id);
    const { username } = useSelector((state: RootState) => state.user);
    const { user } = useFetchUser();
    const location = useSelector((state: RootState) => state.location);
    const distance = route.params.distance.toFixed(2);
    const travelTime = route.params.travelTime;
    const { reviews, loading: ratingLoading, error: errorRateLoading, refetch: refetchRating, averageRating } = useGetReview('Restaurant', restaurant);
    const [ star, setStar ] = useState<number>(averageRating || 0);
    const [ refreshing, setRefreshing ] = useState(false);

    const scrollY = useRef(new Animated.Value(0)).current;
    const [ showMenu, setShowMenu ] = useState(false);

    const headerHeight = scrollY.interpolate({
        inputRange: [ 0, HEADER_SCROLL_DISTANCE ],
        outputRange: [ HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT ],
        extrapolate: 'clamp',
    });

    const headerTitleOpacity = scrollY.interpolate({
        inputRange: [ HEADER_SCROLL_DISTANCE - 20, HEADER_SCROLL_DISTANCE ],
        outputRange: [ 0, 1 ],
        extrapolate: 'clamp',
    });

    const imageOpacity = scrollY.interpolate({
        inputRange: [ 0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE ],
        outputRange: [ 1, 0.5, 0 ],
        extrapolate: 'clamp',
    });

    const imageTranslate = scrollY.interpolate({
        inputRange: [ 0, HEADER_SCROLL_DISTANCE ],
        outputRange: [ 0, -50 ],
        extrapolate: 'clamp',
    });

    useEffect(() => {
        const timer = setTimeout(() => setShowMenu(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleBackPress = () => {
        navigation.goBack();
    };

    const handleLocationPress = () => {
        navigation.navigate('Location', { address: restaurant.coords.address });
    };
    const handleNavToRating = () => {
        if (!username) {
            Alert.alert(
                'Thông báo',
                'Vui lòng đăng nhập để thực hiện chức năng này!',
                [
                    { text: 'Hủy', style: 'cancel' },
                    { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
                ]
            );
            return;
        }
        if (!user?.verification) {
            Alert.alert(
                'Thông báo',
                'Vui lòng xác minh tài khoản trước khi thanh toán',
                [
                    { text: 'Bỏ qua', style: 'cancel' },
                    {
                        text: 'Xác minh ngay',
                        onPress: () => navigation.navigate('Verify'),
                    },
                ]
            );
            return;
        }
        navigation.navigate('RateRestaurant', { restaurant: restaurant })
    }
    useEffect(() => {
        if (averageRating === null || Number.isNaN(averageRating)) {
            setStar(0);
        }
        if (averageRating) {
            setStar(averageRating);
        }
        console.log(averageRating);
    }, [ averageRating ]);

    const onRefresh = () => {

        setRefreshing(true);
        Promise.all([ refetch(), refetchRating() ])
            .finally(() => setRefreshing(false));
    };
    return (
        <SafeAreaView style={styles.container}>
            <Animated.View style={[ styles.header, { height: headerHeight, zIndex: 100000 } ]}>
                <Animated.Image
                    style={[
                        styles.headerBackground,
                        {
                            opacity: imageOpacity,
                            transform: [ { translateY: imageTranslate } ],
                        },
                    ]}
                    source={{ uri: restaurant.imageUrl }}
                />
                <Animated.View
                    style={[
                        styles.headerContent,
                        {
                            opacity: headerTitleOpacity,
                        },
                    ]}
                >
                    <Text style={styles.headerTitle}>{restaurant.title}</Text>
                </Animated.View>
                <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
                    <Icon name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.locationButton} onPress={handleLocationPress}>
                    <Icon name="location-on" size={24} color="#fff" />
                </TouchableOpacity>
            </Animated.View>

            <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [ { nativeEvent: { contentOffset: { y: scrollY } } } ],
                    { useNativeDriver: false }
                )}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.infoContainer}>
                    <Text style={styles.restaurantName}>{restaurant.title}</Text>
                    <View style={styles.ratingContainer}>
                        <View style={styles.starContainer}>
                            <StarRating
                                rating={star}
                                onChange={() => { }}
                                starSize={20}
                                color={'#20B2AA'}
                            />
                            <Text>({star.toFixed(1)})</Text>
                        </View>

                        <TouchableOpacity style={styles.rateButton} onPress={() => handleNavToRating()}>
                            <Text style={styles.rateButtonText}>Đánh giá nhà hàng</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.detailsContainer}>
                        <Text style={styles.detailText}>Khoảnh cách tới nhà hàng: {distance} km</Text>
                        <Text style={styles.detailText}>Thời gian giao hàng dự kiến: {formatTime(travelTime)}</Text>
                    </View>
                    <TouchableOpacity style={styles.exploreButton} onPress={() => navigation.navigate('Review', { restaurant: restaurant })}>
                        <Text style={styles.exploreButtonText}>Xem các đánh giá khác</Text>
                    </TouchableOpacity>
                </View>

                {showMenu && (
                    <Animated.View style={styles.menuContainer}>
                        <Text style={styles.menuTitle}>Menu</Text>
                        {fbr.length === 0 && <Text>Menu chưa được cập nhật...</Text>}

                        {fbr.map((food, index) => (
                            <MenuItem
                                key={food._id}
                                name={food.title}
                                price={food.price}
                                deliveryTime={food.time}
                                image={food.imageUrl}
                                ingredients={food.foodTags}
                                index={index}
                                food={food}
                            />
                        ))}
                    </Animated.View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        overflow: 'hidden',
        elevation: 4,
    },
    headerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        width: null,
        height: HEADER_MAX_HEIGHT,
        resizeMode: 'cover',
    },
    headerContent: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 40 : 20,
        left: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000000,
    },
    locationButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 40 : 20,
        right: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000000,
    },
    scrollViewContent: {
        paddingTop: HEADER_MAX_HEIGHT,
    },
    infoContainer: {
        padding: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        margin: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    restaurantName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    starContainer: {
        flexDirection: 'row',
    },
    rateButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 20,
    },
    rateButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    detailsContainer: {
        marginBottom: 10,
    },
    detailText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    exploreButton: {
        backgroundColor: '#20B2AA',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    exploreButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    menuContainer: {
        padding: 15,
    },
    menuTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    menuItem: {
        flexDirection: 'row',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 15,
    },
    menuItemImage: {
        width: 80,
        height: 80,
        borderRadius: 5,
        marginRight: 10,
    },
    menuItemDetails: {
        flex: 1,
    },
    menuItemName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    menuItemDelivery: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    menuItemIngredients: {
        fontSize: 12,
        color: '#999',
    },
    menuItemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#20B2AA',
    },
});

export default RestaurantScreen;