import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    Animated,
    Easing,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { FoodItems, Order, RootStackParamList } from '../@types';
import useUpdateFood from '../hook/useUpdateFood';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useFetchOrders from '../hook/order/useFetchOrders';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

interface FoodItemProps {
    item: FoodItems;
}

const FoodItem: React.FC<FoodItemProps> = ({ item }) => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { updateFood } = useUpdateFood();
    const { resId } = useSelector((state: RootState) => state.res);
    const [ modalVisible, setModalVisible ] = useState(false);
    const [ foodData, setFoodData ] = useState(item);
    const { deleteFood } = useUpdateFood();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;
    const [ filterOrders, setFilterOrders ] = useState<Order[]>();
    const { orders, loading, error, refetch } = useFetchOrders('All', resId);
    // console.log(item._id)
    useEffect(() => {
        refetch();
        if (orders) {
            // const filter = orders.filter(order => order.orderItems.some(food => food.foodId === item._id));
            // setFilterOrders(filter);
            console.log(orders.map(order => order.orderItems.map(food => food.foodId._id)));
        }
    }, []);
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: modalVisible ? 1 : 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: modalVisible ? 1 : 0.8,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, [ modalVisible, fadeAnim, scaleAnim ]);

    const handleUpdate = () => {
        navigation.navigate('UpdateFoodItem', { foodItem: foodData });
    };

    const handleDelete = () => {
        Alert.alert(
            'Xác nhận xóa',
            'Bạn có chắc chắn xóa món ăn này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đồng ý',
                    onPress: async () => {
                        const deleteResult = await deleteFood(foodData._id);
                        if (deleteResult) {
                            Alert.alert('Đã xóa', 'Món ăn đã được xóa thành công.');
                        } else {
                            Alert.alert('Lỗi', 'Không thể xóa món ăn.');
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const animateButtonPress = () => {
        Animated.sequence([
            Animated.timing(buttonScale, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
                easing: Easing.ease,
            }),
            Animated.timing(buttonScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
                easing: Easing.ease,
            }),
        ]).start();
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.foodItem}
                onPress={() => {
                    animateButtonPress();
                    handleUpdate();
                }}
            >
                <Image source={{ uri: item.imageUrl }} style={styles.foodImage} />
                <View style={styles.foodInfo}>
                    <Text style={styles.foodName}>{item.title}</Text>
                    <Text style={styles.foodPrice}>${item.price}</Text>
                    <Text style={styles.foodDetail}>Thời gian chuẩn bị: {item.time}</Text>
                    <Text style={styles.foodDetail}>
                        Đồ ăn thêm: {item.additives.map(a => `${a.title} (${a.price}đ)`).join(', ')}
                    </Text>
                </View>
                <View style={styles.statusContainer}>
                    <View style={[ styles.statusBadge, item.isAvailable ? styles.available : styles.unavailable ]}>
                        <Text style={styles.statusText}>{item.isAvailable ? 'Sẵn sàng' : 'Hết hàng'}</Text>
                    </View>
                    <View style={styles.iconContainer}>
                        <TouchableOpacity onPress={handleUpdate} style={styles.iconButton}>
                            <Ionicons name="create-outline" size={20} color="#4CAF50" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
                            <Ionicons name="trash-outline" size={20} color="#f44336" />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    foodItem: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginVertical: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    foodImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
    },
    foodInfo: {
        flex: 1,
        marginLeft: 15,
    },
    foodName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    foodPrice: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    foodDetail: {
        fontSize: 14,
        color: '#777',
        marginTop: 2,
    },
    foodTags: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    iconContainer: {
        flexDirection: 'row',
    },
    iconButton: {
        marginLeft: 10,
    },
    statusBadge: {
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginRight: 10,
    },
    available: {
        backgroundColor: '#4CAF50',
    },
    unavailable: {
        backgroundColor: '#f44336',
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    statusContainer: {
        gap: 15,
    }
});

export default FoodItem;
