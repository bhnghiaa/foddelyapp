import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    TextInput,
    Animated,
    Dimensions,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { MapPin, ChevronLeft, Truck, DollarSign, CreditCard } from 'lucide-react-native';
import { SharedElement } from 'react-navigation-shared-element';
import { RadioButton } from 'react-native-paper';
import { Cart, Coordinates, RootStackParamList } from '../@types';
import useFetchCart from '../hook/cart/useFetchCart';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Octicons from 'react-native-vector-icons/Octicons';
import { API, API_LOCATION } from '../constants/api';
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
import { addOrder } from '../redux/orderSlice';
import useAddOrder from '../hook/order/useAddOrder';
import { clearCart } from '../redux/cartSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useRemoveCartItem } from '../hook/cart/useChangeCart';
import useFetchUser from '../hook/user/useFetchUser';
import { date } from 'yup';
import ConfirmOrderModal from '../components/ConfirmOrderModal';
import { formatCurrency } from '../utils/currency';
import axios from 'axios';
import { RootState } from '../redux/store';
import { Suggestion } from './LocationScreen';
import debounce from 'lodash.debounce';
const { width } = Dimensions.get('window');

type PaymentMethod = 'cash' | 'card' | null;



export default function CheckoutScreen() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { user } = useFetchUser();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const [ paymentMethod, setPaymentMethod ] = useState<PaymentMethod>(null);
    const { addToOrder } = useAddOrder();
    const route = useRoute<RouteProp<RootStackParamList, 'Checkout'>>();
    const cartItems = route.params.cartItems;
    const totalAmount = route.params.totalAmount;
    const [ loading, setLoading ] = useState(false);
    const [ subTotal, setSubTotal ] = useState(0);
    const dispatch = useDispatch();
    const removeCartItem = useRemoveCartItem();
    const [ modalVisible, setModalVisible ] = useState(false);
    const deliveryFee = 5000;
    const [ paymentStatus, setPaymentStatus ] = useState<string>('Pending');
    const { address } = useSelector((state: RootState) => state.location);
    const [ addressRecieve, setAddressRecieve ] = useState(address);
    const { latitude, longitude } = useSelector((state: RootState) => state.location);
    const [ suggestions, setSuggestions ] = useState<Suggestion[]>([]);
    const [ selectedSuggestion, setSelectedSuggestion ] = useState<Boolean>(false);
    const [ addressSuggestions, setAddressSuggestions ] = useState<Suggestion[]>([]);
    const [ isSearching, setIsSearching ] = useState(false);
    const [ addressInputError, setAddressInputError ] = useState('');
    const addressInputAnimation = useRef(new Animated.Value(0)).current;
    const [ userAddress, setUserAddress ] = useState<Coordinates>();

    const fetchPaymentIntentClientSecret = async () => {
        try {
            const response = await axios.post(`${API}/api/transactions/create-payment-intent/`, {
                amount: totalAmount + deliveryFee,
                userId: user?._id,
                restaurantId: cartItems[ 0 ].productId.restaurant._id,
                status: "Thanh toán bằng thẻ ngân hàng"
            });

            const { clientSecret } = response.data;
            return clientSecret;
        } catch (error) {
            console.error('Error fetching payment intent client secret:', error);
            throw error;
        }
    };
    const openPaymentSheet = async () => {
        const { error } = await presentPaymentSheet();

        if (error) {
            Alert.alert('Lỗi', error.message);
            setLoading(false);
        } else {
            setPaymentStatus("Success");
            // sendNotification();

            Alert.alert('Thanh toán thành công!', 'Cảm ơn bạn đã mua hàng!');
            navigation.navigate('Orders');
        }
        setLoading(false);
    };
    const handlePlaceOrder = async () => {
        if (!(addressRecieve?.trim())) {
            Alert.alert('Error', 'Please enter delivery address');
            return;
        }
        if (!paymentMethod) {
            Alert.alert('Error', 'Please select payment method');
            return;
        }

        setModalVisible(true);
    };

    const handleConfirmOrder = async () => {
        setLoading(true);

        if (paymentMethod === 'card') {
            try {
                const clientSecret = await fetchPaymentIntentClientSecret();
                const { error } = await initPaymentSheet({
                    paymentIntentClientSecret: clientSecret,
                    merchantDisplayName: 'bhn store',
                });

                if (!error) {
                    await openPaymentSheet();

                    setLoading(false);
                } else {
                    throw new Error(error.message);
                }
            } catch (error: Error | any) {
                Alert.alert('Lỗi', error.message);
                setLoading(false);
                return;
            }
        } else {
            // Cash payment flow
            await addToOrder(orderData);
            cartItems.forEach(item => removeCartItem.mutate(item._id));



            setModalVisible(false);
            navigation.navigate('Orders');
        }
    };

    const orderData = {
        orderItems: cartItems.map((item) => ({
            foodId: item.productId,
            quantity: item.quantity,
            additives: item.additives,
            instructions: item.note,
            price: (item.additives ? item.additives.reduce((acc, additive) => parseInt(additive.price.toString()) + acc, 0) : 0) * item.quantity + item.productId.price * item.quantity,
        })),
        orderTotal: totalAmount,
        deliveryFee: deliveryFee,
        grandTotal: totalAmount + deliveryFee,
        deliveryAddress: addressRecieve || '',
        restaurantAddress: cartItems[ 0 ].productId.restaurant.coords.address,
        paymentMethod: paymentMethod || 'cash',
        paymentStatus: paymentMethod === 'card' ? 'Paid' : 'Pending',
        orderStatus: 'Placed',
        restaurantId: cartItems[ 0 ].productId.restaurant,
        restaurantCoords: [
            cartItems[ 0 ].productId.restaurant.coords.latitude,
            cartItems[ 0 ].productId.restaurant.coords.longitude,
        ],
        recipientCoords: [ userAddress?.latitude ?? 0, userAddress?.longitude ?? 0 ],
    }

    useEffect(() => {
        const handleOrder = async () => {
            if (paymentStatus === "Success") {
                await addToOrder(orderData);
                cartItems.forEach(item => removeCartItem.mutate(item._id));
                setModalVisible(false);


                navigation.navigate('Orders');
            }
        };

        if (paymentStatus !== "Pending" && paymentStatus !== "Handled") {
            handleOrder();
            setPaymentStatus("Handled");
        }
    }, [ paymentStatus ]);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);
    const PaymentMethodOption = ({
        label,
        value,
        selected,
        onSelect,
        icon: Icon,
    }: {
        label: string;
        value: PaymentMethod;
        selected: boolean;
        onSelect: () => void;
        icon: any;
    }) => (
        <TouchableOpacity
            style={[ styles.paymentOption, selected && styles.paymentOptionSelected ]}
            onPress={() => {
                onSelect();
            }}
        >
            <View style={styles.paymentOptionLeft}>
                <RadioButton
                    value={value || ''}
                    status={selected ? 'checked' : 'unchecked'}
                    onPress={onSelect}
                    color="#4CAF50"
                />
                <Icon size={24} color={selected ? '#4CAF50' : '#666'} style={styles.paymentIcon} />
                <Text style={[ styles.paymentOptionText, selected && styles.paymentOptionTextSelected ]}>{label}</Text>
            </View>
        </TouchableOpacity>
    );

    const handleAddressSearch = useCallback(
        debounce(async (query: string) => {
            if (!query.trim()) {
                setAddressSuggestions([]);
                return;
            }

            setIsSearching(true);
            try {
                const response = await axios.get('https://us1.locationiq.com/v1/autocomplete.php', {
                    params: {
                        key: API_LOCATION,
                        q: query,
                        countrycodes: 'VN',
                        format: 'json',
                    },
                });

                setAddressSuggestions(response.data);
            } catch (error) {
                setAddressInputError('Không thể tìm kiếm địa chỉ');
            } finally {
                setIsSearching(false);
            }
        }, 500),
        []
    );

    const handleSelectSuggestion = (suggestion: Suggestion) => {
        setAddressRecieve(suggestion.display_name);
        const coords = {
            latitude: parseFloat(suggestion.lat),
            longitude: parseFloat(suggestion.lon),
        }
        setUserAddress(coords);
        setAddressSuggestions([]);
        setAddressInputError('');

        Animated.sequence([
            Animated.spring(addressInputAnimation, {
                toValue: 1,
                useNativeDriver: true,
                friction: 8,
            }),
            Animated.timing(addressInputAnimation, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start();
    };
    return (
        <SafeAreaView style={styles.container}>
            <Animated.View
                style={[
                    styles.header,
                    { opacity: fadeAnim }
                ]}
            >
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Xác nhận mua hàng</Text>
            </Animated.View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    style={[
                        styles.section,
                        {
                            opacity: fadeAnim,
                            transform: [ { translateY: slideAnim } ],
                        },
                    ]}
                >
                    <View style={styles.addressInput}>
                        <MapPin size={20} color="#666" />
                        <TextInput
                            style={styles.input}
                            placeholder="Địa chỉ giao hàng"
                            value={addressRecieve}
                            onChangeText={(text) => {
                                setAddressRecieve(text);
                                handleAddressSearch(text);
                            }}
                        />
                    </View>
                    {isSearching && <Text>Đang tìm kiếm...</Text>}
                    {addressInputError ? (
                        <Text style={styles.errorText}>{addressInputError}</Text>
                    ) : (
                        addressSuggestions.map((suggestion) => (
                            <TouchableOpacity
                                key={suggestion.place_id}
                                onPress={() => handleSelectSuggestion(suggestion)}
                            >
                                <Text>{suggestion.display_name}</Text>
                            </TouchableOpacity>
                        ))
                    )}
                </Animated.View>

                <Animated.View
                    style={[
                        styles.orderItemContainer,
                        {
                            opacity: fadeAnim,
                            transform: [ { translateY: slideAnim } ],
                        },
                    ]}
                >
                    <View style={[ styles.row, { padding: 8 } ]}>
                        <Fontisto name="shopping-store" size={24} color="#666" />
                        <Text style={styles.paymentButtonText}>{cartItems[ 0 ].productId.restaurant.title}</Text>
                    </View>
                    {cartItems.map((item: Cart) => {
                        const subTotal = item.additives ? item.additives.reduce((acc, additive) => parseInt(additive.price.toString()) + acc, 0) : 0;
                        return (
                            <View key={item._id} style={styles.orderItemContainer}>
                                <View style={styles.rowContainer}>
                                    <Image
                                        source={{ uri: item.productId.imageUrl }}
                                        style={styles.itemImage}
                                    />
                                    <View style={styles.itemDetails}>
                                        <View style={styles.itemInfo}>
                                            <Text style={styles.paymentButtonText}>{item.productId.title}</Text>
                                            <Text style={styles.summaryValue}>{formatCurrency(item.productId.price)}</Text>
                                        </View>
                                        <Text style={styles.itemQuantity}>Số lượng: {item.quantity}</Text>
                                        <Text>Đồ ăn thêm: </Text>
                                        {item.additives && item.additives.map((additive) => (
                                            <View style={[ styles.row, { gap: 5 } ]} key={additive.id}>
                                                <Octicons name="dot-fill" size={22} color="#666" />
                                                <Text key={additive.id} style={styles.itemQuantity}>{additive.title} ({formatCurrency(parseFloat(additive.price))}) </Text>
                                            </View>
                                        ))}
                                        {item.note && <Text style={styles.note}>*Ghi chú: {item.note}</Text>}
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Tổng</Text>
                                            <Text style={styles.itemPrice}>{formatCurrency(subTotal * item.quantity + item.productId.price * item.quantity)}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 }}>
                        <Text style={styles.summaryLabel}>Phí giao hàng:</Text>
                        <Text style={styles.itemPrice}>{formatCurrency(deliveryFee)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 }}>
                        <Text style={styles.totalLabel}>Tổng:</Text>
                        <Text style={styles.totalValue}>{formatCurrency(totalAmount + deliveryFee)}</Text>
                    </View>
                </Animated.View>

                <Animated.View
                    style={[
                        styles.summary,
                        {
                            opacity: fadeAnim,
                            transform: [ { translateY: slideAnim } ],
                        },
                    ]}
                >
                </Animated.View>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Chọn phương thức thanh toán</Text>

                    <PaymentMethodOption
                        label="Tiền mặt"
                        value="cash"
                        selected={paymentMethod === 'cash'}
                        onSelect={() => setPaymentMethod('cash')}
                        icon={DollarSign}
                    />
                    <PaymentMethodOption
                        label="Thẻ ngân hàng"
                        value="card"
                        selected={paymentMethod === 'card'}
                        onSelect={() => setPaymentMethod('card')}
                        icon={CreditCard}
                    />
                </View>
            </ScrollView>
            <TouchableOpacity
                style={styles.placeOrderButton}
                onPress={handlePlaceOrder}
            >
                <Truck size={20} color="#fff" style={styles.placeOrderIcon} />
                <Text style={styles.placeOrderText}>Giao hàng</Text>
            </TouchableOpacity>

            <ConfirmOrderModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onConfirm={handleConfirmOrder}
                totalAmount={totalAmount + deliveryFee}
                itemCount={cartItems.length}
                loading={loading}
            />

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginLeft: 8,
    },
    content: {
        flex: 1,
    },
    section: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    addressInput: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        padding: 12,
    },
    input: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    orderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    orderItemContainer: {
        flexDirection: 'column',
        padding: 8,
        gap: 12,

    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    itemInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    itemQuantity: {
        fontSize: 14,
        color: '#666',
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4CAF50',
    },
    summary: {
        padding: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 16,
        color: '#666',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '500',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '600',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4CAF50',
    },
    paymentButton: {

        backgroundColor: '#4CAF50',
    },
    paymentButtonText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    paymentButtonTextSelected: {
        color: '#fff',
    },
    placeOrderButton: {
        backgroundColor: '#4CAF50',
        margin: 16,
        padding: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeOrderIcon: {
        marginRight: 8,
    },
    placeOrderText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        marginBottom: 12,
    },
    image: {
        width: 80,
        height: 80,
        resizeMode: 'cover',
        borderRadius: 8,
    },
    paymentOptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentOptionText: {
        fontSize: 16,
        marginLeft: 8,
    },
    paymentIcon: {
        width: 80,
        height: 24,
        resizeMode: 'contain',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        color: '#666',
    },
    paymentOptionSelected: {
        borderColor: '#4CAF50',
        backgroundColor: '#F0FFF0',
    },
    paymentOptionTextSelected: {
        color: '#4CAF50',
        fontWeight: '500',
    },
    note: {
        color: '#666',
        fontSize: 14,
        fontStyle: 'italic',
    },
    rowContainer: {
        flexDirection: 'row',
        gap: 10,
        borderBottomColor: '#E5E5E5',
        borderBottomWidth: 1,
    },
    totalRow: {
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    errorText: {
        color: 'red',
        marginTop: 8,
    },
});
