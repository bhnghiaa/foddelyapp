// FoodItem.tsx
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { RootStackParamList } from '../@types';
import { FoodItems } from '../@types';
import { formatCurrency } from '../utils/currency';
interface FoodItemProps {
    item: FoodItems;
}
const FoodItem: React.FC<FoodItemProps> = ({ item }) => {

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const handleNavigate = (item: FoodItems) => {
        navigation.navigate('Food', { food: item });
    };


    return (
        <TouchableOpacity style={styles.foodItem} onPress={() => handleNavigate(item)}>
            <Image source={{ uri: item.imageUrl }} style={styles.foodImage} />
            <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{item.title}</Text>
                <Text style={styles.foodPrice}>{formatCurrency(item.price)}</Text>
                <Text style={styles.foodDelivery}>Thời gian dự kiến dự kiến: {item.time} phút</Text>
            </View>
        </TouchableOpacity>
    )
};

const styles = StyleSheet.create({
    foodItem: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        marginHorizontal: 8,
        width: Dimensions.get('window').width - 110,
    },
    foodImage: {
        width: 110,
        height: 110,
        resizeMode: 'cover',
    },
    foodInfo: {
        flex: 1,
        padding: 12,
    },
    foodName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    foodPrice: {
        fontSize: 14,
        color: 'green',
        marginTop: 4,
    },
    foodDelivery: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
});

export default FoodItem;
