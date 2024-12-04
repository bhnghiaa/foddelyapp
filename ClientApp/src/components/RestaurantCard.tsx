// RestaurantCard.tsx
import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { RestaurantType } from '../@types';
import StarRating from 'react-native-star-rating-widget';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../@types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { calculateDistance } from '../utils/locationUtils';
import { setDistance } from '../redux/locationSlice';
import { useUserLocation } from '../hook/location/useFetchLocation';

interface RestaurantCardProps {
    item: RestaurantType;
    distance: number;
    travelTime: number;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ item, distance, travelTime }) => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const location = useSelector((state: RootState) => state.location);
    const { userCoords, loading: locationLoading, refetch: refetchLocation, fetchLocation } = useUserLocation();
    const dispatch = useDispatch();
    useEffect(() => {
        const initializeLocation = async () => {
            const coords = await fetchLocation();
            if (coords) {
                dispatch(setDistance(calculateDistance(coords, item.coords)));
            }
        };
        initializeLocation();
    }, [ userCoords ]);

    const handleNavigate = (item: RestaurantType) => {
        navigation.navigate('Restaurant', { restaurant: item, distance: distance, travelTime: travelTime });
    };
    return (
        <TouchableOpacity style={styles.card} onPress={() => handleNavigate(item)}>
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.cardSubtitle}>
                    <Text>Cách bạn</Text>
                    {location.distance ? <Text>{distance.toFixed(2)} km</Text> : <Text>loading ...</Text>}
                </View>
                <View style={styles.cardSubtitle}>
                    <Text>Giờ mở cửa</Text>
                    <Text>{item.time}</Text>
                </View>

                {item.ratings != 0 && <View style={styles.starRating}>
                    <StarRating
                        rating={item.ratings}
                        onChange={() => { }}
                        starSize={20}
                        color={'#20B2AA'}
                    />
                    <Text>({item.ratingCount}+) đánh giá</Text>
                </View>}
                {item.ratings == 0 && <View style={styles.starRating}>
                    <StarRating
                        rating={0}
                        onChange={() => { }}
                        starSize={20}
                        color={'#20B2AA'}
                    />
                    <Text>Chưa có đánh giá</Text>
                </View>}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 16,
        marginHorizontal: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        resizeMode: 'cover',
    },
    cardImage: {
        width: Dimensions.get('window').width - 110,
        height: Dimensions.get('window').height / 5.8,
    },
    cardContent: {
        padding: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#20B2AA',
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#666',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    reviewText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    starRating: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    }
});

export default RestaurantCard;
