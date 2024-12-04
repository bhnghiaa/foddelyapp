import React, { useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import StarRating from 'react-native-star-rating-widget';
import { Additive } from '../@types';
import { formatCurrency } from '../utils/currency';

interface CartItemProps {
    name: string;
    price: number;
    image: string;
    note?: string;
    rating?: number;
    quantity: number;
    restaurant?: string;
    additive?: Additive[];
    onRemove?: () => void;
    onDecrement?: () => void;
    onIncrement?: () => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const CartItem: React.FC<CartItemProps> = ({
    name,
    price,
    image,
    note,
    rating,
    quantity,
    restaurant,
    additive,
    onRemove,
    onDecrement,
    onIncrement,
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.05,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, [ quantity ]);

    const handleRemove = () => {
        Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true,
        }).start(() => {
            if (onRemove) {
                onRemove();
            }
            rotateAnim.setValue(0);
        });
    };

    const spin = rotateAnim.interpolate({
        inputRange: [ 0, 1 ],
        outputRange: [ '0deg', '360deg' ],
    });

    return (
        <Animated.View style={[ styles.container, { transform: [ { scale: scaleAnim } ] } ]}>
            <Image source={{ uri: image }} style={styles.image} />
            <View style={styles.contentContainer}>
                <Text style={styles.name} numberOfLines={1}>{name}</Text>
                {additive && additive.map((item, index) => (
                    <Text key={index} style={styles.note} numberOfLines={2}>*{item.title}: {formatCurrency(parseFloat(item.price))}</Text>
                ))}
                {note && <Text style={styles.note} numberOfLines={2}>*note: {note}</Text>}
                <View style={styles.bottomContainer}>
                    <Text style={styles.price}>{formatCurrency(price)}</Text>
                    <View style={styles.quantityContainer}>
                        <TouchableOpacity onPress={onDecrement} disabled={quantity <= 1}>
                            <Icon name="minus-circle" size={24} color={quantity <= 1 ? '#D3D3D3' : '#007AFF'} />
                        </TouchableOpacity>
                        <Text style={styles.quantity}>{quantity}</Text>
                        <TouchableOpacity onPress={onIncrement}>
                            <Icon name="plus-circle" size={24} color="#007AFF" />
                        </TouchableOpacity>
                    </View>
                </View>

            </View>
            <AnimatedTouchableOpacity
                style={[ styles.removeButton, { transform: [ { rotate: spin } ] } ]}
                onPress={handleRemove}
            >
                <Icon name="trash-2" size={24} color="#FF3B30" />
            </AnimatedTouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 12,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
    },
    restaurant: {
        fontSize: 16,
        color: '#666666',
    },
    ratingContainer: {
        flexDirection: 'row',
    },
    note: {
        fontSize: 14,
        color: '#666666',
    },
    bottomContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantity: {
        fontSize: 16,
        fontWeight: 'bold',
        marginHorizontal: 8,
    },
    removeButton: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
});

export default CartItem;
