import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Animated,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Dimensions,
    Easing,
    FlatList,
    Modal,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Additive, Cart, RootStackParamList } from '../@types';
import { COLORS, SIZES } from '../constants/theme';
import PhoneVerificationModal from '../components/PhoneVerificationModal';
import Toast, { BaseToast } from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import useAddToCart from '../hook/cart/useAddProductToCart';
import { RootState } from '../redux/store';
import useFetchCart from '../hook/cart/useFetchCart';
import { clearCart, removeProductFromCart } from '../redux/cartSlice';
import useClearCart from '../hook/cart/useClearCart';
import { formatCurrency } from '../utils/currency';


const { width, height } = Dimensions.get('window');


const FoodScreen: React.FC = () => {
    const [ quantity, setQuantity ] = useState(1);
    const [ note, setNote ] = useState('');
    const [ additives, setAdditives ] = React.useState<Additive[]>([]);
    const [ totalAdditives, setTotalAdditives ] = React.useState<number>(0);
    const [ modalVisible, setModalVisible ] = useState(false);
    const { addToCart } = useAddToCart();
    const { cartItems = [], refetch } = useFetchCart() as { cartItems: Cart[], refetch: () => void };
    const { clearCartItem, loading, error, count } = useClearCart();

    const handleRemoveItem = (cartItemId: string) => {
        clearCartItem(cartItemId);
    };
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const route = useRoute<RouteProp<RootStackParamList, 'Food'>>();
    const food = route.params.food;
    const scrollY = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const dispatch = useDispatch();
    const { username, userId } = useSelector((state: RootState) => state.user);

    const [ scale ] = useState(new Animated.Value(1));
    interface ToastConfig {
        [ key: string ]: (internalState: any) => JSX.Element;
        success: (internalState: any) => JSX.Element;
    }

    const toastConfig: ToastConfig = {
        success: (internalState) => (
            <BaseToast
                {...internalState}
                style={{ borderLeftColor: 'green' }}
                text1Style={styles.toastTitle}
                text2Style={styles.toastMessage}
            />
        ),
    };
    const totalPrice = ((food.price + totalAdditives) * quantity).toString();

    useEffect(() => {

    }, [ totalPrice ]);
    const handleAddToCart = () => {
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
        const existingRestaurantTitles = cartItems.map((item) => item.productId.restaurant.title);
        if (!existingRestaurantTitles.includes(food.restaurant.title)) {
            cartItems.forEach((item) => {
                dispatch(removeProductFromCart(item._id));
                clearCartItem(item._id);
            });
            addToCart(food._id, quantity, parseFloat(totalPrice), additives, note);
        } else {
            addToCart(food._id, quantity, parseFloat(totalPrice), additives, note);
        }
        // addToCart(food._id, quantity, parseFloat(totalPrice), additives, note);

        Animated.sequence([
            Animated.timing(scale, {
                toValue: 1.2,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start(() => {
            Toast.show({
                type: 'success',
                text1: 'Đã thêm vào giỏ hàng',
                text2: 'Sản phẩm đã được thêm thành công!',
                position: 'top',
            });
        });
    };

    const handleToCartScreen = () => {
        if (!username) {
            Alert.alert(
                'Thông báo',
                'Vui lòng đăng nhập để thực hiện chức năng này!',
                [
                    { text: 'Hủy', style: 'cancel' },
                    { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
                ]
            );
            return;
        }
        navigation.navigate('Cart');
    }
    const handleAdditives = (isChecked: boolean, id: number) => {
        if (isChecked) {
            setAdditives((prev) => [ ...prev, food.additives.find((item) => item.id === id)! ]);
        } else {
            setAdditives((prev) => prev.filter((item) => item.id !== id));
        }
    }
    const renderAdditives = ({ item }: { item: Additive }) => {
        return (
            <BouncyCheckbox
                size={25}
                fillColor={COLORS.primary}
                unFillColor={COLORS.white}
                iconStyle={{ borderColor: COLORS.gray }}
                textComponent={
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1, marginLeft: 8 }}>
                        <Text>{item.title}</Text>
                        <Text>{formatCurrency(parseFloat(item.price))}</Text>
                    </View>
                }
                innerIconStyle={{ borderWidth: 2 }}
                onPress={(isChecked: boolean) => handleAdditives(isChecked, item.id)}
                style={{ marginVertical: 2 }}
            />
        )
    }
    useEffect(() => {
        setTotalAdditives(additives.reduce((acc, item) => acc + parseFloat(item.price), 0));
    }, [ additives ]);
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const imageTranslateY = scrollY.interpolate({
        inputRange: [ 0, 200 ],
        outputRange: [ 0, -20 ],
        extrapolate: 'clamp',
    });

    const imageScale = scrollY.interpolate({
        inputRange: [ -200, 0, 200 ],
        outputRange: [ 1.5, 1, 1 ],
        extrapolate: 'clamp',
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [ 0, 20 ],
        outputRange: [ 0, 1 ],
        extrapolate: 'clamp',
    });

    const renderTag = (tag: string, index: number) => {
        const tagAnim = useRef(new Animated.Value(0)).current;

        useEffect(() => {
            Animated.spring(tagAnim, {
                toValue: 1,
                friction: 3,
                tension: 40,
                delay: index * 100,
                useNativeDriver: true,
            }).start();
        }, []);

        return (
            <Animated.View
                key={tag}
                style={[
                    styles.tag,
                    {
                        opacity: tagAnim,
                        transform: [
                            { scale: tagAnim },
                            {
                                rotate: tagAnim.interpolate({
                                    inputRange: [ 0, 1 ],
                                    outputRange: [ '-30deg', '0deg' ],
                                }),
                            },
                        ],
                    },
                ]}
            >
                <Text style={styles.tagText}>{tag}</Text>
            </Animated.View>
        );
    };
    return (
        <SafeAreaView style={styles.container}>
            <Animated.View style={[ styles.header, { opacity: headerOpacity } ]}>
                <Text style={styles.headerTitle}>{food.restaurant.title}</Text>
            </Animated.View>
            <View style={styles.topIcons}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <Icon name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => handleAddToCart()}>
                    <Icon name="add-shopping-cart" size={22} color="#FFFFFF" />
                </TouchableOpacity>
                <Toast config={toastConfig} />

            </View>
            <ScrollView
                style={styles.scrollView}
                onScroll={Animated.event(
                    [ { nativeEvent: { contentOffset: { y: scrollY } } } ],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >
                <Animated.Image
                    source={{ uri: food.imageUrl }}
                    style={[
                        styles.foodImage,
                        {
                            transform: [
                                { translateY: imageTranslateY },
                                { scale: imageScale },
                            ],
                        },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.contentContainer,
                        {
                            opacity: fadeAnim,
                            transform: [ { scale: scaleAnim } ],
                        },
                    ]}
                >
                    <Text style={styles.foodTitle}>{food.title}</Text>
                    <Text style={styles.foodPrice}>{formatCurrency(food.price)}</Text>
                    <Text style={styles.foodDescription}>
                        {food.description}
                    </Text>
                    <View style={styles.tagsContainer}>
                        {food.foodTags.map((tag, index) => renderTag(tag, index))}
                    </View>
                    <Text style={styles.sectionTitle}>Món ăn kèm</Text>
                    <FlatList
                        data={food.additives}
                        keyExtractor={(item) => item.title.toString()}
                        showsHorizontalScrollIndicator={false}
                        scrollEnabled={false}
                        renderItem={renderAdditives} />
                    <View style={styles.quantityContainer}>
                        <Text style={styles.sectionTitle}>Số lượng</Text>
                        <View style={styles.quantityControls}>
                            <TouchableOpacity
                                onPress={() => setQuantity(prev => Math.max(1, prev - 1))}
                                style={styles.quantityButton}
                            >
                                <Icon name="remove" size={24} color={COLORS.tertiary} />
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{quantity}</Text>
                            <TouchableOpacity
                                onPress={() => setQuantity(prev => prev + 1)}
                                style={styles.quantityButton}
                            >
                                <Icon name="add" size={24} color={COLORS.tertiary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View>
                        <View style={styles.row}>
                            <Text style={styles.title}>Tổng số</Text>
                            <Text style={[ styles.title, { color: COLORS.primary } ]}>
                                {formatCurrency(parseFloat(totalPrice))}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.sectionTitle}>Ghi chú</Text>
                    <TextInput
                        style={styles.preferencesInput}
                        placeholder="Bạn muốn lưu ý điều gì?"
                        value={note}
                        onChangeText={setNote}
                        multiline
                        maxLength={20}
                    />
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.placeOrderButton} onPress={() => handleToCartScreen()}>
                            <Text style={styles.placeOrderButtonText}>Giỏ hàng</Text>
                            <Icon name="shopping-cart" size={22} color="#FFFFFF" />
                        </TouchableOpacity>
                        {/* <TouchableOpacity style={styles.placeOrderButton} onPress={() => setModalVisible(true)}>
                            <Text style={styles.placeOrderButtonText}>Thanh toán</Text>
                            <Icon name="shopping-cart" size={24} color="#FFFFFF" />
                        </TouchableOpacity> */}
                    </View>
                </Animated.View>
                <PhoneVerificationModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onVerify={() => setModalVisible(false)}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: COLORS.tertiary,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
    },
    foodImage: {
        width: width,
        height: height * 0.4,
        resizeMode: 'cover',
    },
    contentContainer: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30,
    },
    foodTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 10,
    },
    foodPrice: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.tertiary,
        marginBottom: 10,
    },
    foodDescription: {
        fontSize: 16,
        color: '#666666',
        marginBottom: 15,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    tag: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        marginRight: 10,
        marginBottom: 10,
    },
    tagText: {
        color: COLORS.tertiary,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 15,
        marginTop: 20,
    },
    toppingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    toppingCheckbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: COLORS.tertiary,
        borderRadius: 4,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toppingName: {
        flex: 1,
        fontSize: 16,
        color: '#333333',
    },
    toppingPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.tertiary,
    },
    quantityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        width: 40,
        height: 40,
        backgroundColor: '#E8F5E9',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 15,
    },
    preferencesInput: {
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    placeOrderButton: {
        backgroundColor: COLORS.tertiary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
        flex: 1,
    },
    placeOrderButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
    },
    topIcons: {
        position: 'absolute',
        top: 10,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        zIndex: 2000,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        gap: 10
    },
    title: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: COLORS.black,
    },
    modalContainer: {
        backgroundColor: COLORS.offwhite,
        opacity: 1,
        borderRadius: 20,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        width: '100%',
        position: 'absolute',
        bottom: 0,
    },
    modalText: {
        fontSize: 20,
        marginBottom: 20,
    },
    closeButton: {
        color: 'blue',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    toastTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    toastMessage: {
        fontSize: 14,
    },
});

export default FoodScreen;