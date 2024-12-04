import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Easing,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { FoodItems, RootStackParamList } from '../@types';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { formatAddress } from '../utils/locationUtils';

const { width } = Dimensions.get('window');

interface FoodItemProps {
    item: FoodItems;
}

const FoodSearchItem: React.FC<FoodItemProps> = ({ item }) => {

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const handlePress = (item: FoodItems) => {
        navigation.navigate('Food', { food: item });
    };



    return (
        <Animated.View style={[ styles.container ]}>
            <TouchableOpacity activeOpacity={0.8} onPress={() => handlePress(item)}>
                <LinearGradient
                    colors={[ '#ffffff', '#f0f0f0' ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    <Image source={{ uri: item.imageUrl }} style={styles.image} />
                    <View style={styles.infoContainer}>
                        <Text style={styles.name} numberOfLines={2}>{item.title}</Text>
                        <Text style={styles.price}>đ{item.price}</Text>
                        <Text style={styles.deliveryInfo}>{formatAddress(item.restaurant.coords.address)}</Text>
                        <View style={styles.deliveryInfo}>
                            <Icon name="clock-outline" size={16} color="#666" />
                            <Text style={styles.deliveryTime}>
                                Giao hàng dự kiến: {item.time}
                            </Text>
                        </View>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: width - 32,
        // marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 16,
        overflow: 'hidden',

    },
    gradient: {
        flexDirection: 'row',
        padding: 12,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 12,
    },
    infoContainer: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    deliveryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deliveryTime: {
        marginLeft: 4,
        fontSize: 14,
        color: '#666',
    },
    addButtonContainer: {
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    addButton: {
        backgroundColor: '#FF5722',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default FoodSearchItem;