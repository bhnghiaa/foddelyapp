import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Animated,
    Dimensions,
    StatusBar,
    Alert,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { NavigationProp, StackActions, useNavigation } from '@react-navigation/native';
import { Coordinates, RootStackParamList } from '../@types';
import { setUserData } from '../redux/userSlice';
import { launchImageLibrary, launchCamera, Asset } from 'react-native-image-picker';
import axios from 'axios';
import useFetchUser from '../hook/user/useFetchUser';
import { API, API_LOCATION } from '../constants/api';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import { findOptimalRoute, getRoutes } from '../utils/locationUtils';

const { width, height } = Dimensions.get('window');

const CLOUDINARY_URL = '0';
const CLOUDINARY_UPLOAD_PRESET = '0';

const Profile = () => {
    const scrollY = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const { username, email, profile, token } = useSelector((state: RootState) => state.user);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const dispatch = useDispatch();
    const { user, loading: loadingUser, error: errorUser, refetch: refetchUser } = useFetchUser();
    const [ refreshing, setRefreshing ] = useState(false);
    const [ optimizedRoute, setOptimizedRoute ] = useState<Coordinates[]>([]);

    const menuItems: { icon: string; label: keyof typeof menuItemLabels }[] = [
        { icon: 'location-outline', label: 'address' },
        { icon: 'card-outline', label: 'paymentHistory' },
        { icon: 'storefront-outline', label: 'ownerApp' },
        { icon: 'settings-outline', label: 'settings' },
    ];

    const menuItemLabels = {
        address: 'Địa chỉ',
        paymentHistory: 'Lịch sử thanh toán',
        ownerApp: 'Ứng dụng cho chủ quán',
        settings: 'Cài đặt',
    };

    const onRefresh = () => {
        setRefreshing(true);
        Promise.all([ refetchUser() ])
            .finally(() => setRefreshing(false));
    };

    const handleLogin = () => {
        navigation.navigate('Login');
    };

    const handleRegister = () => {
        navigation.navigate('SignUp');
    };

    const handleLogout = () => {
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc chắn muốn đăng xuất?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Có',
                    onPress: () => {
                        dispatch(setUserData({
                            username: '', token: '', profile: '', email: '',
                            userId: ''
                        }));
                        navigation.dispatch(
                            StackActions.replace('Login')
                        );
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const handleSelectAvatar = async () => {
        if (username === '') {
            Alert.alert('Sign in required', 'Please sign in to change your avatar.');
        } else {
            Alert.alert(
                'Select Avatar',
                'Choose an option',
                [
                    {
                        text: 'Camera',
                        onPress: () => {
                            launchCamera({ mediaType: 'photo' }, async (response) => {
                                if (!response.didCancel && response.assets) {
                                    const image = response.assets[ 0 ];
                                    await uploadImage(image);
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
                                    await uploadImage(image);
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
        }
    };

    const uploadImage = async (image: Asset) => {
        const formData = new FormData();
        formData.append('file', {
            uri: image.uri,
            type: image.type,
            name: image.fileName,
        });
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        try {
            const res = await axios.post(CLOUDINARY_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const newAvatarUrl = res.data.secure_url;

            dispatch(setUserData({
                username, email, token, profile: newAvatarUrl,
                userId: user?._id || '',
            }));

            await updateAvatarInDatabase(newAvatarUrl);
        } catch (error: Error | any) {
            Alert.alert('Upload failed', error.message);
        }
    };

    const updateAvatarInDatabase = async (avatarUrl: string) => {
        Alert.alert(
            'Confirm Update',
            'Do you want to update your avatar?',
            [
                {
                    text: 'No',
                    onPress: () => { },
                    style: 'cancel',
                },
                {
                    text: 'Yes',
                    onPress: async () => {
                        try {
                            const response = await axios.patch(`${API}/api/user`,
                                { profile: avatarUrl },
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                        'Content-Type': 'application/json',
                                    }
                                }
                            );

                            if (response.status === 200) {
                                Alert.alert('Success', 'Avatar updated successfully!');
                            } else {
                                Alert.alert('Error', 'Failed to update avatar in the database.');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to update avatar in the database.');
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

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

    const renderMenuItem = (item: { icon: string; label: keyof typeof menuItemLabels }, index: number) => {
        const itemAnimation = useRef(new Animated.Value(50)).current;

        useEffect(() => {
            Animated.timing(itemAnimation, {
                toValue: 0,
                duration: 300,
                delay: index * 100,
                useNativeDriver: true,
            }).start();
        }, []);

        const handleNav = (label: string) => {
            if (label === 'address')
                navigation.navigate('Location', { address: "", driverId: "" });
            if (label === 'paymentHistory')
                navigation.navigate('PaymentHistory');
        };

        return (
            <Animated.View
                key={index}
                style={[
                    styles.menuItem,
                    {
                        transform: [ { translateX: itemAnimation } ],
                    },
                ]}
            >
                <TouchableOpacity style={styles.menuItemContent} onPress={() => handleNav(item.label)}>
                    <Icon name={item.icon} size={24} color="#4A4A4A" />
                    <Text style={styles.menuItemText}>{menuItemLabels[ item.label ]}</Text>
                    <Icon name="chevron-forward" size={24} color="#4A4A4A" />
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <ScrollView style={styles.container} refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
            <Animated.View style={[ styles.header ]}>
                <View style={styles.profileInfo}>
                    <TouchableOpacity onPress={handleSelectAvatar}>
                        <Image
                            source={
                                user?.profile
                                    ? { uri: user.profile }
                                    : require('../assets/avatar.png')
                            }
                            style={styles.avatar}
                        />
                    </TouchableOpacity>
                    <Animated.View style={[ styles.userInfo, { opacity: fadeAnim, transform: [ { translateY: slideAnim } ] } ]}>
                        <View style={styles.usernameContainer}>
                            <Text style={styles.username}>
                                {username === '' ? 'Tài khoản khách' : username}
                            </Text>
                            {username && (
                                <View style={styles.row}>
                                    {user?.verification ? (
                                        <MaterialIcons name="verified" size={20} color="blue" style={styles.verifiedIcon} />
                                    ) : (
                                        <Octicons name="verified" size={20} color="red" style={styles.verifiedIcon} />
                                    )}
                                    {!user?.verification && (
                                        <TouchableOpacity onPress={() => navigation.navigate('Verify')}>
                                            <Text style={styles.txtVerify}>Xác minh tài khoản</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </View>
                    </Animated.View>
                    {username && (
                        <TouchableOpacity onPress={() => handleLogout()} style={styles.logoutButton}>
                            <AntDesign name="logout" size={24} color="red" />
                        </TouchableOpacity>
                    )}
                </View>
                <View style={styles.authButtons}>
                    {!username ? (
                        <>
                            <TouchableOpacity style={styles.authButton} onPress={() => handleLogin()}>
                                <Text style={styles.authButtonText}>Đăng nhập</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[ styles.authButton, styles.registerButton ]} onPress={() => handleRegister()}>
                                <Text style={styles.authButtonText}>Đăng kí</Text>
                            </TouchableOpacity>
                        </>
                    ) : null}
                </View>
            </Animated.View>

            {/* <ScrollView
                style={styles.scrollView}
                onScroll={Animated.event([ { nativeEvent: { contentOffset: { y: scrollY } } } ], { useNativeDriver: false })}
                scrollEventThrottle={16}
            >
                {menuItems.map((item, index) => renderMenuItem(item, index))}
            </ScrollView> */}
            <ScrollView style={styles.scrollView}>
                {menuItems.map((item, index) => renderMenuItem(item, index))}
            </ScrollView>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        paddingHorizontal: 10,
        paddingVertical: 20,
    },
    profileInfo: {
        flexDirection: 'row',
        marginBottom: 10,
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: '#FFF',
    },
    userInfo: {
        marginLeft: 10,
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    email: {
        fontSize: 16,
        color: '#333',
    },
    authButtons: {
        flexDirection: 'row',
    },
    authButton: {
        backgroundColor: '#ccc',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginRight: 10,
    },
    registerButton: {
        backgroundColor: '#FF4081',
    },
    authButtonText: {
        color: '#333',
        fontWeight: 'bold',
    },
    logoutButton: {
        marginLeft: 'auto',
    },
    scrollView: {
        flex: 1,
    },
    menuItem: {
        backgroundColor: '#FFF',
        marginBottom: 1,
    },
    menuItemContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    menuItemText: {
        marginLeft: 10,
        fontSize: 18,
        color: '#4A4A4A',
    },
    usernameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    verifiedIcon: {
        marginLeft: 5,
    },
    txtVerify: {
        color: 'red',
        fontSize: 11,
        marginLeft: 5,
        fontStyle: 'italic'
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    }
});

export default Profile;