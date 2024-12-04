import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Dimensions,
    StatusBar,
    RefreshControl,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants/theme';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import CartItem from '../components/CartItem';
import useFetchCart from '../hook/cart/useFetchCart';
import { Cart, RootStackParamList } from '../@types';
import { useIncrementProductQuantity, useDecrementProductQuantity, useRemoveCartItem } from '../hook/cart/useChangeCart';
import { useStripe } from '@stripe/stripe-react-native';
import { API } from '../constants/api';
import { clearCart } from '../redux/cartSlice';
import useFetchUser from '../hook/user/useFetchUser';
import { formatCurrency } from '../utils/currency';
const { width } = Dimensions.get('window');

const CartScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { cartItems = [], refetch } = useFetchCart() as { cartItems: Cart[], refetch: () => void };
    const [ refreshing, setRefreshing ] = useState(false);
    const { user } = useFetchUser();

    const decrement = useDecrementProductQuantity();
    const increment = useIncrementProductQuantity();
    const removeCartItem = useRemoveCartItem();

    const [ cartItemsCopy, setCartItemsCopy ] = useState<Cart[]>(cartItems);
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [ loading, setLoading ] = useState(false);
    const [ paymentStatus, setPaymentStatus ] = useState<string | null>(null);
    const dispatch = useDispatch();

    useEffect(() => {
        setCartItemsCopy(cartItems);
    }, [ cartItems ]);
    const onRefresh = async () => {
        setRefreshing(true);
        refetch();
        setRefreshing(false);
    };

    const handleDecrement = (id: string) => {
        setCartItemsCopy((prevItems) =>
            prevItems.map(item =>
                item._id === id && item.quantity > 0
                    ? { ...item, totalPrice: item.totalPrice - item.totalPrice / item.quantity, quantity: item.quantity - 1 }
                    : item
            )
        );
        decrement.mutate(id);
    }
    const handleIncrement = (id: string) => {
        setCartItemsCopy((prevItems) =>
            prevItems.map(item =>
                item._id === id ? { ...item, totalPrice: item.totalPrice + item.totalPrice / item.quantity, quantity: item.quantity + 1 } : item
            )
        );
        increment.mutate(id);
    }

    const handleRemoveItem = (id: string) => {
        setCartItemsCopy((prevItems) => prevItems.filter(item => item._id !== id));
        removeCartItem.mutate(id);
    }
    const totalAmount = cartItemsCopy.reduce((sum, item) => sum + item.totalPrice, 0);

    const handleCheckout = async () => {

        if (cartItemsCopy.length === 0) {
            Alert.alert('Thông báo', 'Giỏ hàng của bạn đang trống');
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
        }
        else {
            navigation.navigate('Checkout', { cartItems: cartItemsCopy, totalAmount: totalAmount });
        }

        return;
    };

    const openPaymentSheet = async () => {
        const { error } = await presentPaymentSheet();

        if (error) {
            Alert.alert('Lỗi', error.message);
            setPaymentStatus('Thất bại');
        } else {
            Alert.alert('Thanh toán thành công!', 'Cảm ơn bạn đã mua hàng!');
            setPaymentStatus('Thành công');
            setCartItemsCopy([]);
            cartItemsCopy.forEach(item => removeCartItem.mutate(item._id));
            navigation.navigate('Orders');
        }
        setLoading(false);
    };

    const renderCartItem = ({ item }: { item: Cart }) => {
        return (
            <CartItem
                name={item.productId.title}
                restaurant={item.productId.restaurant.title}
                price={item.totalPrice}
                image={item.productId.imageUrl}
                quantity={item.quantity}
                additive={item.additives}
                note={item.note}
                onRemove={() => handleRemoveItem(item._id)}
                onDecrement={() => handleDecrement(item._id)}
                onIncrement={() => handleIncrement(item._id)}
            />
        );
    };
    const handleBack = () => {
        navigation.goBack();

    }
    // Calculate total amount of items in cart

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
            <View style={styles.header}>
                <View style={styles.row}>
                    <TouchableOpacity onPress={() => handleBack()} style={styles.backButton}>
                        <Icon name="arrow-back" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Giỏ hàng</Text>
                </View>
            </View>
            <FlatList
                data={cartItemsCopy.sort((a, b) => a.productId.restaurant.title.localeCompare(b.productId.restaurant.title))}
                renderItem={renderCartItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                ListEmptyComponent={<Text style={styles.emptyMessage}>Giỏ hàng của bạn đang trống.</Text>}
            />
            <View style={styles.footer}>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalText}>Tổng:</Text>
                    <Text style={styles.totalAmount}>{formatCurrency(totalAmount)}</Text>
                </View>
                <TouchableOpacity style={styles.checkoutButton} onPress={() => handleCheckout()}>
                    <Text style={styles.checkoutButtonText}>Mua hàng</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        justifyContent: 'flex-start',
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: COLORS.primary,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    backButton: {
        width: 30,
        height: 30,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
    },
    emptyMessage: {
        textAlign: 'center',
        fontSize: 18,
        color: COLORS.gray,
        marginTop: 20,
    },
    footer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    totalText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    checkoutButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
    },
    checkoutButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
});

export default CartScreen;
