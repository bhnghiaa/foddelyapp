import { FC, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, ActivityIndicator, Alert, Animated, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import useRestaurant from "../hook/useUpdateRestaurant";
import useFetchRestaurant from '../hook/useFetchRestaurant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary, launchCamera, Asset } from 'react-native-image-picker';
import axios from 'axios';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../@types';
import { setUserData } from '../redux/userSlice';
import { formatCurrency } from '../utils/currency';

const CLOUDINARY_URL = '0';
const CLOUDINARY_UPLOAD_PRESET = '0';

const RestaurantProfile: FC = () => {
    const dispatch = useDispatch();
    const { username, userId } = useSelector((state: RootState) => state.user);
    const { updateRestaurant, loading, error } = useRestaurant();
    const [ restaurantId, setRestaurantId ] = useState('');
    const { restaurant, loading: fetchLoading, error: fetchError, refetch } = useFetchRestaurant();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const [ isEditing, setIsEditing ] = useState(false);
    const [ formData, setFormData ] = useState({
        title: username,
        time: '9:00 - 22:00',
        imageUrl: restaurant?.imageUrl || 'https://example.com/cover.jpg',
        logoUrl: restaurant?.logoUrl || 'https://example.com/logo.jpg',
        code: 'REST123',
        rating: 4.5,
        reviewCount: 200,
        priceRange: `${formatCurrency(10000)} - ${formatCurrency(100000)}`,
        categories: [ 'Cơm', 'Món Việt' ],
        coords: {
            latitude: 0,
            longitude: 0,
            address: '123 Đường ABC, Quận 1, TP.HCM',
            title: 'Chi nhánh chính'
        }
    });

    const [ refreshing, setRefreshing ] = useState(false);

    useEffect(() => {
        const fetchRestaurantId = async () => {
            if (restaurantId) {
                setRestaurantId(restaurantId);
            }
        };
        fetchRestaurantId();
        if (restaurant) {
            setFormData({
                ...formData,
                logoUrl: restaurant.logoUrl,
                imageUrl: restaurant.imageUrl,
            })
        }
    }, []);

    const handleSelectImage = async (type: 'logo' | 'cover') => {
        Alert.alert(
            'Select Image',
            'Choose an option',
            [
                {
                    text: 'Camera',
                    onPress: () => {
                        launchCamera({ mediaType: 'photo' }, async (response) => {
                            if (!response.didCancel && response.assets) {
                                const image = response.assets[ 0 ];
                                await uploadImage(image, type);
                            }
                        });
                    },
                },
                {
                    text: 'Gallery',
                    onPress: () => {
                        launchImageLibrary({ mediaType: 'photo' }, async (response) => {
                            if (!response.didCancel && response.assets) {
                                const image = response.assets[ 0 ];
                                await uploadImage(image, type);
                            }
                        });
                    },
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ],
            { cancelable: true }
        );
    };

    const uploadImage = async (image: Asset, type: 'logo' | 'cover') => {
        try {
            const formData = new FormData();
            formData.append('file', {
                uri: image.uri,
                type: image.type,
                name: image.fileName,
            });
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

            const res = await axios.post(CLOUDINARY_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const imageUrl = res.data.secure_url;

            // Update form data with new image URL
            setFormData(prev => ({
                ...prev,
                [ type === 'logo' ? 'logoUrl' : 'imageUrl' ]: imageUrl
            }));

            // Save to backend
            await updateRestaurant(restaurantId, {
                [ type === 'logo' ? 'logoUrl' : 'imageUrl' ]: imageUrl
            });

            Alert.alert('Success', 'Image updated successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to upload image');
            console.error(error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('token');
                            dispatch(setUserData({
                                userId: '',
                                username: '',
                                token: '',
                                profile: '',
                                email: '',
                                verifyVendor: false
                            }));
                            // Dispatch logout action - assumes you have a logout action
                            dispatch({ type: 'LOGOUT' });
                            // Navigate to login - assumes you have navigation setup
                            navigation.navigate('Login');
                        } catch (error) {
                            console.error('Logout error:', error);
                            Alert.alert('Error', 'Failed to logout');
                        }
                    }
                }
            ]
        );
    };

    if (fetchLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#ee4d2d" />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Header Section */}

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.coverImageContainer}
                    onPress={isEditing ? () => handleSelectImage('cover') : undefined}
                >

                    <Image
                        source={{ uri: restaurant?.imageUrl }}
                        style={styles.coverImage}
                    />
                    <View style={styles.imageOverlay}>
                        <Icon name="camera-alt" size={24} color="#fff" />
                        <Text style={styles.changeImageText}>Change Cover</Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.overlay} />
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={isEditing ? () => handleSelectImage('logo') : undefined}
                        style={styles.logoContainer}
                    >
                        <Image
                            source={{ uri: restaurant?.logoUrl }}
                            style={styles.logo}
                        />
                        <View style={styles.logoOverlay}>
                            <Icon name="camera-alt" size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.restaurantName}>{restaurant?.title}</Text>
                        <View style={styles.ratingBox}>
                            <Icon name="star" size={16} color="#FFB100" />
                            <Text style={styles.rating}>{formData.rating}</Text>
                            <Text style={styles.reviewCount}>({formData.reviewCount})</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Quick Info Section */}
            <View style={styles.quickInfo}>
                <View style={styles.infoItem}>
                    <Icon name="schedule" size={24} color="#ee4d2d" />
                    <Text style={styles.infoText}>{restaurant?.time}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Icon name="attach-money" size={24} color="#ee4d2d" />
                    <Text style={styles.infoText}>{formData.priceRange}</Text>
                </View>
            </View>

            {/* Categories Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Danh mục món ăn</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.categoryRow}>
                        {restaurant?.foods.map((food, index) => (
                            <View key={index} style={styles.categoryBadge}>
                                <Text style={styles.categoryText}>{food}</Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Location Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Icon name="location-on" size={24} color="#ee4d2d" />
                    <Text style={styles.sectionTitle}>Địa chỉ</Text>
                </View>
                <Text style={styles.addressText}>{restaurant?.coords.address}</Text>
            </View>

            {/* Edit Mode */}
            {isEditing ? (
                <View style={styles.editContainer}>
                    <TextInput
                        style={styles.input}
                        value={formData.title}
                        placeholder="Tên nhà hàng"
                        placeholderTextColor="#999"
                    />
                    <TextInput
                        style={styles.input}
                        value={formData.time}
                        placeholder="Giờ mở cửa"
                        placeholderTextColor="#999"
                    />
                    <TextInput
                        style={styles.input}
                        value={formData.priceRange}
                        placeholder="Khoảng giá"
                        placeholderTextColor="#999"
                    />
                    <TextInput
                        style={[ styles.input, styles.multilineInput ]}
                        value={formData.coords.address}
                        placeholder="Địa chỉ"
                        placeholderTextColor="#999"
                        multiline
                    />
                    <View style={styles.buttonGroup}>
                        <TouchableOpacity
                            style={[ styles.button, styles.cancelButton ]}
                            onPress={() => setIsEditing(false)}
                        >
                            <Text style={styles.buttonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[ styles.button, styles.saveButton ]}
                            onPress={() => { }}
                        >
                            <Text style={styles.buttonText}>Lưu</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditing(true)}
                >
                    <Icon name="edit" size={20} color="#fff" />
                    <Text style={styles.editButtonText}>Chỉnh sửa thông tin</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                style={[ styles.editButton, styles.logoutButton ]}
                onPress={handleLogout}
            >
                <Icon name="logout" size={20} color="#fff" />
                <Text style={styles.editButtonText}>Đăng xuất</Text>
            </TouchableOpacity>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        height: 250,
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        // ...StyleSheet.absoluteFillObject,
        // backgroundColor: 'rgba(0,0,0,0.3)',
    },
    headerContent: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: '#fff',
    },
    headerInfo: {
        marginLeft: 15,
    },
    restaurantName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 4,
    },
    rating: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 4,
    },
    reviewCount: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    quickInfo: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 12,
        margin: 15,
        elevation: 2,
    },
    infoItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    infoText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#333',
    },
    section: {
        backgroundColor: '#fff',
        marginHorizontal: 15,
        marginBottom: 15,
        borderRadius: 12,
        padding: 15,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
    },
    categoryRow: {
        flexDirection: 'row',
        paddingVertical: 5,
    },
    categoryBadge: {
        backgroundColor: '#fff3f0',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#ee4d2d',
    },
    categoryText: {
        color: '#ee4d2d',
        fontSize: 14,
        fontWeight: '500',
    },
    addressText: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
    },
    editContainer: {
        padding: 15,
        backgroundColor: '#fff',
        margin: 15,
        borderRadius: 12,
        elevation: 2,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
    },
    multilineInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    button: {
        flex: 1,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#666',
    },
    saveButton: {
        backgroundColor: '#ee4d2d',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ee4d2d',
        margin: 15,
        padding: 15,
        borderRadius: 12,
        elevation: 2,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
    },
    coverImageContainer: {
        height: '100%',
        width: '100%',
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0,
    },
    changeImageText: {
        color: '#fff',
        marginTop: 8,
        fontSize: 16,
    },
    logoContainer: {
        position: 'relative',
    },
    logoOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 40,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0,
    },
    logoutButton: {
        backgroundColor: '#dc3545',
        marginBottom: 30, // Add some bottom margin
    }
});

export default RestaurantProfile;