import AsyncStorage from '@react-native-async-storage/async-storage';
import { FC, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import useFetchRestaurant from '../hook/useFetchRestaurant';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../@types';

interface Props { }

const Verify: FC<Props> = (props) => {
    const { username, userId } = useSelector((state: RootState) => state.user);
    const {
        restaurant,
        loading: restaurantLoading,
        error: restaurantError,
        refetch: refetchRestaurant,
        fetchDataRestaurant
    } = useFetchRestaurant(userId);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    console.log('restaurant', restaurant);
    useEffect(() => {
        fetchDataRestaurant();
    }, []);

    useEffect(() => {
        if (!restaurantLoading && restaurant) {
            switch (restaurant.verification) {
                case "Verified":
                    navigation.reset({
                        index: 0,
                        routes: [ { name: 'Home' } ],
                    });
                    break;
                case "Pending":
                    navigation.navigate('Pending');
                    break;
                default:
                    navigation.navigate('AddRestaurant');
                    break;
            }
        } else {
            navigation.navigate('AddRestaurant');
        }
    }, [ restaurant, restaurantLoading, navigation ]);

    if (restaurantLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.verifyText}>Đang chờ xác thực</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666'
    },
    verifyText: {
        fontSize: 18,
        color: '#333',
        textAlign: 'center'
    }
});

export default Verify;