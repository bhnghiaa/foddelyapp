import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    StyleSheet,
    TouchableWithoutFeedback,
    Platform,
    PermissionsAndroid,
    Animated,
    ScrollView,
    RefreshControl,
    Alert,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import debounce from 'lodash.debounce';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../@types';
import GetLocation from 'react-native-get-location';
import Fontisto from 'react-native-vector-icons/Fontisto';
import { calculateDistance, calculateTravelTime, findOptimalRoute, formatTime, getCurrentLocation, getRoutes, reverseGeocode } from '../utils/locationUtils';
import { API_LOCATION } from '../constants/api';
import { useUserLocation, useAddress, } from '../hook/location/useFetchLocation';
import { useDispatch } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDriver } from '../hook/user/getDriver';

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


const LocationScreen = () => {

    const route = useRoute<RouteProp<RootStackParamList, 'Location'>>();
    const initAddress = route.params?.address;
    const driverId = route.params?.driverId;
    const [ restaurantAddress, setRestaurantAddress ] = useState(initAddress);
    const { userCoords, loading: locationLoading, refetch: refetchLocation, fetchLocation } = useUserLocation();
    const [ location, setLocation ] = useState<Location>();
    const [ region, setRegion ] = useState(location);
    const [ refreshing, setRefreshing ] = useState(false);
    const { fetchDriverLocation, driverCoords, refetch } = useUserLocation();
    const { driver, loading, error, getDriver } = useDriver();
    const [ isDeliveryComplete, setIsDeliveryComplete ] = useState(false);

    useEffect(() => {
        const fetchDriver = async () => {
            const driverData = await getDriver(driverId);
        };
        const driverInfo = {
            avatar: driver?.profile,
            name: driver?.username,
            phone: driver?.phone,
        }
        console.log(driverInfo, "driverInfo")
        fetchDriver();
    }, [ driverId, refreshing ]);

    useEffect(() => {
        if (driverId) {
            fetchDriverLocation(driverId);
            // if (driverCoords)
            //     console.log(driverCoords, "driverCoords")
        }
    }, [ refreshing ]);

    // useEffect(() => {
    //     console.log(driverId, "driverId")
    //     if (driverId) {
    //         fetchDriverLocation(driverId);
    //         console.log(driverCoords?.latitude, driverCoords?.longitude, "driverCoords")
    //     }

    //     const intervalId = setInterval(() => {
    //         if (driverId) {
    //             fetchDriverLocation(driverId);
    //             console.log(driverCoords?.latitude, driverCoords?.longitude, "driverCoords")
    //         }
    //     }, 5000);

    //     return () => clearInterval(intervalId);
    // }, []);
    useEffect(() => {
        if (userCoords) {
            setMyLocationMarker({
                latitude: userCoords.latitude,
                longitude: userCoords.longitude,
            });
        }
    }, [ userCoords ]);
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
    const [ addressMarker, setAddressMarker ] = useState<Coordinates | null>(null);
    const [ searchMarker, setSearchMarker ] = useState<Coordinates | null>(null);
    const [ routeCoordinates, setRouteCoordinates ] = useState<Coordinates[]>([]);
    const [ search, setSearch ] = useState('');
    const [ distance, setDistance ] = useState<number | null>(null);
    const [ travelTime, setTravelTime ] = useState<number>(0);
    const [ isCardVisible, setIsCardVisible ] = useState(false);
    const [ selectedSuggestion, setSelectedSuggestion ] = useState<Boolean>(false);
    const [ regionAnimation ] = useState(new Animated.Value(0));
    const [ markerScale ] = useState(new Animated.Value(0));
    const [ storeIconRotation ] = useState(new Animated.Value(0));
    const [ cardOpacity ] = useState(new Animated.Value(0));
    const [ isDisabled, setIsDisabled ] = useState(true);
    const [ suggestions, setSuggestions ] = useState<Suggestion[]>([]);
    const [ optimizedRoute, setOptimizedRoute ] = useState<Coordinates[]>([]);

    const API_KEY = API_LOCATION;

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
        requestLocationPermission();

        // const intervalId = setInterval(getCurrentLocation, 1000); // Call getCurrentLocation every 10 seconds

        // return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const initializeLocation = async () => {
            const coords = await fetchLocation();
        };

        initializeLocation();
    }, []);

    // Fetch coordinates for address in route params
    useEffect(() => {
        const fetchCoordinates = async () => {
            if (!restaurantAddress) return;
            try {
                const response = await axios.get('https://us1.locationiq.com/v1/search.php', {
                    params: {
                        key: API_KEY,
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
    }, [ restaurantAddress, 3000 ]);

    // Fetch route between two points
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

    // Fetch autocomplete suggestions
    const handleSearch = useCallback(
        debounce(async (query) => {
            if (!query) return;
            try {
                const response = await axios.get('https://us1.locationiq.com/v1/autocomplete.php', {
                    params: {
                        key: API_KEY,
                        q: query,
                        countrycodes: 'VN', // Tìm kiếm trong Việt Nam
                        format: 'json',
                    },
                });

                if (response.data) {
                    setSuggestions(response.data);
                }
            } catch (error) {
            }
        }, 1000),
        []

    );

    const handleSelectSuggestion = async (suggestion: Suggestion) => {
        const newRegion = {
            latitude: parseFloat(suggestion.lat),
            longitude: parseFloat(suggestion.lon),
            latitudeDelta: 0.0122,
            longitudeDelta: 0.0121,
        };
        setSelectedSuggestion(true);

        // Animate region change
        Animated.parallel([
            Animated.timing(regionAnimation, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(markerScale, {
                toValue: 1,
                friction: 5,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();

        // Smoothly update region
        setRegion(newRegion);

        // Animate marker appearance
        const markerCoords = {
            latitude: parseFloat(suggestion.lat),
            longitude: parseFloat(suggestion.lon),
        };

        setSearchMarker(markerCoords);
        setSuggestions([]);
        setSearch(suggestion.display_name);

        // Fetch and animate route
        await fetchRoutes(addressMarker!, newRegion);
    };

    const handleClearSearch = () => {
        setSelectedSuggestion(false);
        // Fade out animations
        Animated.parallel([
            Animated.timing(regionAnimation, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(markerScale, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start(() => {
            setSearch('');
            setSuggestions([]);
            setSearchMarker(null);
            setRestaurantAddress(initAddress);

            // Animate to new route
            fetchRoutes(myLocationMarker, addressMarker!);
        });
    };

    const handleIconSearch = (search: string) => {
        // search = "21.007472216788088, 105.8426206356317"
        if (!selectedSuggestion || !search) {
            return;
        }
        fetchRoutes(addressMarker!, searchMarker!);
        setRegion({
            latitude: searchMarker!.latitude,
            longitude: searchMarker!.longitude,
            latitudeDelta: 0.0122,
            longitudeDelta: 0.0121,
        });

        // if (selectedSuggestion || !search) {
        //     return;
        // }
        // const searchArray = search.split(",");
        // const newGeo: Coordinates = {
        //     latitude: parseFloat(searchArray[ 0 ]),
        //     longitude: parseFloat(searchArray[ 1 ]),
        // }
        // fetchRoutes(myLocationMarker, newGeo);
        // setAddressMarker(newGeo);
        // setRegion({
        //     latitude: parseFloat(searchArray[ 0 ]),
        //     longitude: parseFloat(searchArray[ 1 ]),
        //     latitudeDelta: 0.0122,
        //     longitudeDelta: 0.0121,
        // });
        // reverseGeocode(newGeo.latitude, newGeo.longitude).then((data) => {
        //     setRestaurantAddress(data.display_name);
        // });
    }

    const handleMyLocation = () => {
        setRegion({
            latitude: myLocationMarker.latitude,
            longitude: myLocationMarker.longitude,
            latitudeDelta: 0.0122,
            longitudeDelta: 0.0121,
        });

        // If driver location exists, show route from driver to user
        if (driverCoords) {
            fetchRoutes(driverCoords, myLocationMarker);
        } else {
            // Otherwise show default route from restaurant to user
            fetchRoutes(myLocationMarker, addressMarker!);
        }
    };

    const handleAddressLocation = () => {
        if (driverCoords) {
            // Set region to driver location
            setRegion({
                latitude: driverCoords.latitude,
                longitude: driverCoords.longitude,
                latitudeDelta: 0.0122,
                longitudeDelta: 0.0121,
            });
            fetchRoutes(driverCoords, myLocationMarker);
        } else {
            setRegion({
                latitude: addressMarker!.latitude,
                longitude: addressMarker!.longitude,
                latitudeDelta: 0.0122,
                longitudeDelta: 0.0121,
            });
            fetchRoutes(myLocationMarker, addressMarker!);
        }
    };

    useEffect(() => {
        if (addressMarker) {
            if (driverCoords) {
                fetchRoutes(driverCoords, myLocationMarker);
            } else {
                fetchRoutes(myLocationMarker, addressMarker);
            }

            if (distance !== null) {
                setTravelTime((calculateTravelTime(distance)));
            }
        }
    }, [ myLocationMarker, driverCoords ]);

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

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refetch();
            await getCurrentLocation();
            await refetchLocation();

            if (addressMarker) {
                if (driverCoords) {
                    await fetchRoutes(driverCoords, myLocationMarker);
                } else {
                    await fetchRoutes(myLocationMarker, addressMarker);
                }
            }

            if (searchMarker && selectedSuggestion) {
                await fetchRoutes(addressMarker!, searchMarker);
            }

            if (userCoords) {
                setRegion({
                    latitude: userCoords.latitude,
                    longitude: userCoords.longitude,
                    latitudeDelta: 0.0122,
                    longitudeDelta: 0.0121,
                });
            }
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            setRefreshing(false);
        }
    }, [ userCoords, addressMarker, searchMarker, myLocationMarker, driverCoords ]);

    useEffect(() => {
        if (!driverId || isDeliveryComplete) return;

        const updateDriverLocation = async () => {
            await fetchDriverLocation(driverId);

            if (driverCoords && userCoords) {
                const distanceToUser = calculateDistance(driverCoords, userCoords);

                if (distanceToUser < 0.2) { // 0.2km threshold
                    setIsDeliveryComplete(true);
                    Alert.alert('Thông báo', 'Shipper đã đến nơi!');
                    // setIsDeliveryComplete(false);
                }
            }
        };

        // Initial update
        updateDriverLocation();

        // Set up interval
        const intervalId = setInterval(updateDriverLocation, 2000);

        // Cleanup on unmount or when delivery completes
        return () => clearInterval(intervalId);
    }, [ driverId, isDeliveryComplete, userCoords ]);

    useEffect(() => {
        if (isDeliveryComplete) {
            Alert.alert(
                'Thông báo',
                'Shipper đã đến nơi!',
                [ { text: 'OK', onPress: () => console.log('OK Pressed') } ]
            );
        }
    }, [ isDeliveryComplete ]);

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

    return (
        <SafeAreaView style={styles.container}>
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
                        description="Đây là vị trí ban đầu của bạn"
                    />

                    {/* Marker for address from route params */}
                    {addressMarker && (
                        <Marker
                            coordinate={addressMarker}
                            title={restaurantAddress || ""}
                        />
                    )}

                    {/* Marker for search location */}
                    {searchMarker && (
                        <Marker
                            coordinate={searchMarker}
                            title="Địa điểm tìm kiếm"
                            description="Đây là địa điểm bạn tìm kiếm"
                        >
                        </Marker>
                    )}

                    {driverCoords && (
                        <Marker
                            coordinate={{
                                latitude: driverCoords.latitude,
                                longitude: driverCoords.longitude
                            }}
                            title="Vị trí shipper"
                            description="Đây là vị trí hiện tại tại của shipper"
                        >
                            <View style={styles.driverMarker}>
                                <MaterialCommunityIcons
                                    name="motorbike"
                                    size={30}
                                    color="#1e90ff"
                                />
                            </View>
                        </Marker>
                    )}

                    {/* Polyline for route */}
                    {routeCoordinates.length > 0 && (
                        <Polyline
                            coordinates={routeCoordinates}
                            strokeColor="#1e90ff"
                            strokeWidth={5}
                        />
                    )}
                </MapView>
            </ScrollView>

            <View style={styles.searchContainer}>
                <TouchableOpacity onPress={() => handleIconSearch(search)}>
                    <Ionicons name="search" size={20} color="#000" style={styles.searchIcon} />
                </TouchableOpacity>
                <TextInput
                    style={styles.searchBar}
                    placeholder="Tìm kiếm địa điểm"
                    value={search}
                    onChangeText={(text) => {
                        setSearch(text);
                        handleSearch(text);
                    }}
                />
                <MaterialIcons name="clear" size={20} color="#000" onPress={handleClearSearch} />
            </View>

            {suggestions.length > 0 && (
                <FlatList
                    data={suggestions}
                    keyExtractor={(item) => item.place_id}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleSelectSuggestion(item)}>
                            <View style={styles.suggestionItem}>
                                <Text>{item.display_name}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    style={styles.suggestionsList}
                />
            )}
            <TouchableOpacity style={styles.btnMyLocation} onPress={handleMyLocation}>
                <MaterialIcons name="my-location" size={25} color="#1e90ff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnAddressLocation} onPress={toggleCard}>
                <Animated.View style={{
                    transform: [ {
                        rotate: storeIconRotation.interpolate({
                            inputRange: [ 0, 1 ],
                            outputRange: [ '0deg', '360deg' ]
                        })
                    } ]
                }}>
                    {driverCoords ? (
                        <MaterialCommunityIcons
                            name="motorbike"
                            size={22}
                            color="#1e90ff"
                        />
                    ) : (
                        <Fontisto
                            name="shopping-store"
                            size={22}
                            color="#1e90ff"
                        />
                    )}
                </Animated.View>
            </TouchableOpacity>

            {((driverCoords && driver) || (restaurantAddress && distance !== null)) && (
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
                        {driverCoords && driver ? (
                            <View style={styles.driverInfoContainer}>
                                <Text style={styles.driverName}>
                                    Tài xế: {driver.username}
                                </Text>
                                <Text style={styles.driverPhone}>
                                    SĐT: {driver.phone}
                                </Text>
                                {distance && (
                                    <Text style={styles.distanceText}>
                                        Khoảng cách: {distance.toFixed(2)} km ({formatTime(travelTime)})
                                    </Text>
                                )}
                            </View>
                        ) : (
                            <Text style={styles.cardText}>
                                {restaurantAddress}: {distance?.toFixed(2)} km
                            </Text>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    map: { ...StyleSheet.absoluteFillObject },
    searchContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 10,
        left: 10,
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 20,
        zIndex: 1,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    searchIcon: {
        marginRight: 8,
        padding: 2
    },
    searchBar: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 2,
    },
    suggestionsList: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 100 : 60,
        left: 10,
        right: 10,
        backgroundColor: '#fff',
        zIndex: 1,
        borderRadius: 8,
        elevation: 5,
        maxHeight: '60%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    suggestionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    btnMyLocation: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#fff',
        borderRadius: 50,
        padding: 5,
        elevation: 5,
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
    },
    scrollView: {
        flex: 1,
        height: '100%',
    },
    driverMarker: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 5,
        borderWidth: 2,
        borderColor: '#1e90ff',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    driverInfoContainer: {
        gap: 4,
    },
    driverName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    driverPhone: {
        fontSize: 14,
        color: '#666',
    },
    distanceText: {
        fontSize: 14,
        color: '#1e90ff',
        marginTop: 4,
    },
});

export default LocationScreen;