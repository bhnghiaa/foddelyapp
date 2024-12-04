import { FC, useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, ScrollView, RefreshControl, Platform, PermissionsAndroid } from 'react-native';
import { useUserLocation } from '../hook/location/useFetchLocation';
import MapView, { Marker, Polyline } from 'react-native-maps';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../@types';
import axios from 'axios';
import { API_LOCATION } from '../constants/api';
import Fontisto from 'react-native-vector-icons/Fontisto';
import GetLocation from 'react-native-get-location';
import { calculateTravelTime, findOptimalRoute, formatTime, getCurrentLocation, getRoutes } from '../utils/locationUtils';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { COLORS } from '../constants/theme';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
interface Props { }
interface Coordinates {
    latitude: number;
    longitude: number;
}
interface Location {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}
export interface Suggestion {
    place_id: string;
    lat: string;
    lon: string;
    display_name: string;
}
const NEU_DORMITORY = {
    latitude: 20.999353,
    longitude: 105.846564,
    title: "Vị trí của khách hàng",
    description: "Kí túc xá Đại học Kinh tế Quốc dân"
};
const LocationScreen: FC<Props> = (props) => {
    const [ refreshing, setRefreshing ] = useState(false);

    const { userCoords, loading: locationLoading, refetch: refetchLocation, fetchLocation } = useUserLocation();
    const [ location, setLocation ] = useState<Location>();
    const [ region, setRegion ] = useState(location);
    const [ regionAnimation ] = useState(new Animated.Value(0));
    const [ addressMarker, setAddressMarker ] = useState<Coordinates | null>(null);

    const route = useRoute<RouteProp<RootStackParamList, 'Location'>>();
    const initAddress = route.params?.address;
    const deliveryAddress = route.params?.deliveryAddress;
    const [ customerAddress, setCustomerAddress ] = useState(deliveryAddress);
    const [ customerMarker, setCustomerMarker ] = useState<Coordinates | null>(null);
    const [ restaurantAddress, setRestaurantAddress ] = useState(initAddress);
    const { isAvailable } = useSelector((state: RootState) => state.driver);

    const [ onDelivery, setOnDelivery ] = useState(isAvailable);

    useEffect(() => {
        setRestaurantAddress(initAddress);
    }, [ initAddress ]);
    useEffect(() => {
        setCustomerAddress(deliveryAddress);
    }, [ deliveryAddress ]);
    useEffect(() => {
        setOnDelivery(isAvailable);
    }, [ onDelivery ]);
    const [ routeCoordinates, setRouteCoordinates ] = useState<Coordinates[]>([]);
    const [ storeIconRotation ] = useState(new Animated.Value(0));
    const [ isCardVisible, setIsCardVisible ] = useState(false);
    const [ cardOpacity ] = useState(new Animated.Value(0));
    const [ isDisabled, setIsDisabled ] = useState(true);
    const [ distance, setDistance ] = useState<number | null>(null);
    const [ optimizedRoute, setOptimizedRoute ] = useState<Coordinates[]>([]);
    const [ travelTime, setTravelTime ] = useState<number>(0);
    const { updateLocation } = useUserLocation();

    const getCurrentLocation = () => {
        GetLocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 15000,
        })
            .then(location => {
                setLocation({
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                });
                setMyLocationMarker({
                    latitude: location.latitude,
                    longitude: location.longitude,
                });
            })
            .catch(error => {
            });
    };
    useEffect(() => {
        const requestLocationPermission = async () => {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Quyền truy cập vị trí',
                        message: 'Ứng dụng này cần quyền truy cập vị trí của bạn.',
                        buttonNeutral: 'Hỏi sau',
                        buttonNegative: 'Hủy',
                        buttonPositive: 'Đồng ý',
                    }
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    return;
                }
            }
            getCurrentLocation();
        };


        requestLocationPermission();
        // console.log(isAvailable);
        // if (!isAvailable) {
        //     const intervalId = setInterval(getCurrentLocation, 2000); // Call getCurrentLocation every 10 seconds
        //     return () => clearInterval(intervalId);
        // }
    }, []);
    useEffect(() => {
        const initializeLocation = async () => {
            const coords = await fetchLocation();
        };

        initializeLocation();
    }, []);
    useEffect(() => {
        if (userCoords) {
            setMyLocationMarker({
                latitude: userCoords.latitude,
                longitude: userCoords.longitude,
            });
        }
    }, [ userCoords ]);
    useEffect(() => {
        const fetchCoordinates = async () => {
            if (!restaurantAddress) return;
            try {
                const response = await axios.get('https://us1.locationiq.com/v1/search.php', {
                    params: {
                        key: API_LOCATION,
                        q: restaurantAddress,
                        countrycodes: 'VN', // Chỉ lấy địa điểm trong khu vực Việt Nam
                        format: 'json',
                        limit: 1,
                    },
                });

                if (response.data && response.data[ 0 ]) {
                    const { lat, lon } = response.data[ 0 ];
                    const newAddressMarker: Coordinates = {
                        latitude: parseFloat(lat),
                        longitude: parseFloat(lon),
                    };
                    setAddressMarker(newAddressMarker);

                    // const travelTime = Math.ceil(calculateTravelTime(distance));
                    // setTravelTime(travelTime);

                    setRegion({
                        latitude: newAddressMarker.latitude,
                        longitude: newAddressMarker.longitude,
                        latitudeDelta: 0.0122,
                        longitudeDelta: 0.0121,
                    });

                    // Fetch route from my location to address marker
                    // await fetchRoutes(myLocationMarker, newAddressMarker);
                }
            } catch (error) {
            }
        };

        fetchCoordinates();
    }, [ restaurantAddress ]);

    useEffect(() => {
        const fetchCoordinates = async () => {
            if (!customerAddress) return;
            try {
                const response = await axios.get('https://us1.locationiq.com/v1/search.php', {
                    params: {
                        key: API_LOCATION,
                        q: customerAddress,
                        countrycodes: 'VN', // Chỉ lấy địa điểm trong khu vực Việt Nam
                        format: 'json',
                        limit: 1,
                    },
                });

                if (response.data && response.data[ 0 ]) {
                    const { lat, lon } = response.data[ 0 ];
                    const newAddressMarker: Coordinates = {
                        latitude: parseFloat(lat),
                        longitude: parseFloat(lon),
                    };
                    setCustomerMarker(newAddressMarker);

                    // const travelTime = Math.ceil(calculateTravelTime(distance));
                    // setTravelTime(travelTime);

                    setRegion({
                        latitude: newAddressMarker.latitude,
                        longitude: newAddressMarker.longitude,
                        latitudeDelta: 0.0122,
                        longitudeDelta: 0.0121,
                    });

                    // Fetch route from my location to address marker
                    // await fetchRoutes(myLocationMarker, newAddressMarker);
                }
            } catch (error) {
            }
        };

        fetchCoordinates();
    }, [ customerAddress ]);

    const fetchRoutes = async (start: Coordinates, end: Coordinates) => {
        const routes = await getRoutes(start, end);

        if (routes.length > 0) {
            const { route, distance } = findOptimalRoute(routes);
            setOptimizedRoute(route);
            setRouteCoordinates(route);
            setDistance(distance);
            calculateTravelTime(distance);
        }
    };

    const initialRegion = {
        latitude: userCoords?.latitude || 21.007472216788088,
        longitude: userCoords?.longitude || 105.8426206356317,
        latitudeDelta: 0.0122,
        longitudeDelta: 0.0121,
    };
    const [ myLocationMarker, setMyLocationMarker ] = useState({
        latitude: initialRegion.latitude,
        longitude: initialRegion.longitude,
    });

    const handleMyLocation = () => {
        if (!isAvailable) {
            getCurrentLocation();
            updateLocation(myLocationMarker);
        }
        setRegion({
            latitude: myLocationMarker.latitude,
            longitude: myLocationMarker.longitude,
            latitudeDelta: 0.0122,
            longitudeDelta: 0.0121,
        });
        if (initAddress != '') {
            fetchRoutes(myLocationMarker, addressMarker!);
        } else {
            fetchRoutes(myLocationMarker, customerMarker!);
        }
    };
    const handleAddressLocation = () => {
        setRegion({
            latitude: addressMarker!.latitude,
            longitude: addressMarker!.longitude,
            latitudeDelta: 0.0122,
            longitudeDelta: 0.0121,
        });
        fetchRoutes(myLocationMarker, addressMarker!);
    }
    useEffect(() => {
        if (initAddress != '') {
            if (addressMarker) {
                fetchRoutes(myLocationMarker, addressMarker);
                if (distance !== null) {
                    setTravelTime((calculateTravelTime(distance)));
                }
            }
        }
    }, [ myLocationMarker ]);
    useEffect(() => {
        if (customerMarker) {
            fetchRoutes(myLocationMarker, customerMarker);
            if (distance !== null) {
                setTravelTime((calculateTravelTime(distance)));
            }
        }
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            // Refresh user location
            await refetchLocation();

            // Refresh routes if address marker exists
            //   if (addressMarker) {
            //     await fetchRoutes(myLocationMarker, addressMarker);
            //   }

            // Update region to current location
            if (userCoords)
                setRegion({
                    latitude: userCoords.latitude,
                    longitude: userCoords.longitude,
                    latitudeDelta: 0.0122,
                    longitudeDelta: 0.0121,
                });
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            setRefreshing(false);
        }
    }, [ userCoords, addressMarker, myLocationMarker ]);
    if (locationLoading || !userCoords) {
        return (
            <View>
                <Text>Đang tải...</Text>
            </View>
        );
    }
    const initRegion = {
        latitude: userCoords.latitude,
        longitude: userCoords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    }

    const toggleCard = () => {
        const toValue = isCardVisible ? 0 : 1;

        Animated.parallel([
            Animated.spring(storeIconRotation, {
                toValue,
                useNativeDriver: true,
                friction: 8,
                tension: 40
            }),
            Animated.timing(cardOpacity, {
                toValue,
                duration: 200,
                useNativeDriver: true
            })
        ]).start(() => {
            setIsDisabled(!isDisabled);
        });

        setIsCardVisible(!isCardVisible);
    };
    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         if (!isAvailable) {
    //             getCurrentLocation();
    //             updateLocation(myLocationMarker);
    //         }
    //     }, 2000);

    //     return () => clearTimeout(timer); // Cleanup the timer if the component unmounts
    // }, []);
    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollView}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[ '#1e90ff' ]}
                        tintColor="#1e90ff"
                        titleColor="#1e90ff"
                    />
                }
            >
                <MapView
                    style={styles.map}
                    region={region || initRegion}
                    showsUserLocation={true}
                    showsMyLocationButton={false}
                    onRegionChange={(region) => {
                        Animated.spring(regionAnimation, {
                            toValue: 1,
                            friction: 5,
                            tension: 40,
                            useNativeDriver: true,
                        }).start();
                    }}
                >
                    <Marker
                        coordinate={myLocationMarker}
                        title="Vị trí của bạn"
                        description="Đây là vị trí của bạn"
                    />

                    {customerMarker && (
                        <Marker
                            coordinate={customerMarker}
                            title={"Vị trí của khách hàng"}
                            description={customerAddress}
                        >
                            <FontAwesome6 name="building-user" size={30} color="#1e90ff" />
                        </Marker>
                    )}

                    {addressMarker && initAddress !== '' && (
                        <Marker
                            coordinate={addressMarker}
                            title={restaurantAddress || ""}
                        >
                            <TouchableOpacity style={styles.addressLocation} onPress={toggleCard}>
                                <Animated.View style={{
                                    transform: [ {
                                        rotate: storeIconRotation.interpolate({
                                            inputRange: [ 0, 1 ],
                                            outputRange: [ '0deg', '360deg' ]
                                        })
                                    } ]
                                }}>
                                    <Fontisto name="shopping-store" size={22} color="#1e90ff" />
                                </Animated.View>
                            </TouchableOpacity>
                        </Marker>
                    )}

                    {routeCoordinates.length > 0 && (
                        <Polyline
                            coordinates={routeCoordinates}
                            strokeColor="#1e90ff"
                            strokeWidth={5}
                        />
                    )}
                </MapView>
            </ScrollView>
            <TouchableOpacity style={styles.btnMyLocation} onPress={handleMyLocation}>
                <MaterialIcons name="my-location" size={25} color="#1e90ff" />
            </TouchableOpacity>
            {(
                <>
                    <TouchableOpacity style={styles.btnAddressLocation} onPress={toggleCard}>
                        <Animated.View style={{
                            transform: [ {
                                rotate: storeIconRotation.interpolate({
                                    inputRange: [ 0, 1 ],
                                    outputRange: [ '0deg', '360deg' ]
                                })
                            } ]
                        }}>
                            {(initAddress != '') ? <Fontisto name="shopping-store" size={22} color="#1e90ff" /> : <FontAwesome6 name="building-user" size={22} color="#1e90ff" />}
                            {/* <Fontisto name="shopping-store" size={22} color="#1e90ff" /> */}
                        </Animated.View>
                    </TouchableOpacity>

                    {restaurantAddress && distance !== null && (
                        <Animated.View
                            pointerEvents={isDisabled ? 'none' : 'auto'}
                            style={[
                                styles.cardContainer,
                                {
                                    opacity: cardOpacity,
                                    transform: [ {
                                        translateX: cardOpacity.interpolate({
                                            inputRange: [ 0, 1 ],
                                            outputRange: [ -20, 0 ]
                                        })
                                    } ]
                                }
                            ]}
                        >
                            <TouchableOpacity
                                onPress={handleAddressLocation}
                                disabled={isDisabled}
                            >
                                <Text style={styles.cardText}>
                                    {restaurantAddress}: {distance.toFixed(2)} km - {formatTime(travelTime)}
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                    {customerAddress && distance !== null && (initAddress == '') && (
                        <Animated.View
                            pointerEvents={isDisabled ? 'none' : 'auto'}
                            style={[
                                styles.cardContainer,
                                {
                                    opacity: cardOpacity,
                                    transform: [ {
                                        translateX: cardOpacity.interpolate({
                                            inputRange: [ 0, 1 ],
                                            outputRange: [ -20, 0 ]
                                        })
                                    } ]
                                }
                            ]}
                        >
                            <TouchableOpacity
                                onPress={handleAddressLocation}
                                disabled={isDisabled}
                            >
                                <Text style={styles.cardText}>
                                    {customerAddress}: {distance.toFixed(2)} km - {formatTime(travelTime)}
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                </>
            )}

        </View>);
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    map: { ...StyleSheet.absoluteFillObject },
    btnMyLocation: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#fff',
        borderRadius: 50,
        padding: 5,
        elevation: 5,
    },
    scrollView: {
        flex: 1,
        height: '100%',
    },
    btnAddressLocation: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        backgroundColor: '#fff',
        borderRadius: 50,
        padding: 10,
        elevation: 5,
    },
    addressLocation: {
        backgroundColor: '#fff',
        borderRadius: 50,
        padding: 10,
        elevation: 5,
    },
    card: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 20,
        paddingBottom: 30,
        borderTopStartRadius: 20,
        borderTopEndRadius: 20,
        elevation: 10,
        flexWrap: 'wrap',

    },
    cardContainer: {
        position: 'absolute',
        left: 70, // Position it next to the button
        bottom: 10,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        elevation: 5,
        maxWidth: '70%', // Limit width to prevent overflow
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    cardText: {
        fontSize: 14,
        color: '#333',
    }
});

export default LocationScreen;