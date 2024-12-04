// AddRestaurantScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import debounce from 'lodash/debounce';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../@types';
import { API } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary, launchCamera, Asset } from 'react-native-image-picker';
import axios from 'axios';
import useFetchCategories from '../hook/categoryHook';
import RNPickerSelect from 'react-native-picker-select';

interface Suggestion {
    place_id: string;
    lat: string;
    lon: string;
    display_name: string;
}

const CLOUDINARY_URL = '0';
const CLOUDINARY_UPLOAD_PRESET = '0';

const AddRestaurantScreen = () => {
    const [ title, setTitle ] = useState('');
    const [ time, setTime ] = useState('');
    const [ imageUrl, setImageUrl ] = useState('');
    const [ owner, setOwner ] = useState('');
    const { userId } = useSelector((state: RootState) => state.user);
    const [ code, setCode ] = useState('');
    const [ logoUrl, setLogoUrl ] = useState('');
    const [ latitude, setLatitude ] = useState('');
    const [ longitude, setLongitude ] = useState('');
    const [ address, setAddress ] = useState('');
    const [ coordTitle, setCoordTitle ] = useState('');
    const [ verifyVendor, setVerifyVendor ] = useState(false);
    const [ suggestions, setSuggestions ] = useState<Suggestion[]>([]);
    const [ loading, setLoading ] = useState(false);
    const [ foods, setFoods ] = useState<string[]>([]);
    const [ foodTag, setFoodTag ] = useState('');
    const { categories } = useFetchCategories();

    console.log("hiiiii");

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const API_KEY = 'pk.d54027a5d51bcfd5be6e8e8842a087a0';

    useEffect(() => {
        setOwner(userId);
    }, []);

    const handleSearch = useCallback(
        debounce(async (query) => {
            if (!query) return;
            setLoading(true);
            try {
                const response = await axios.get('https://us1.locationiq.com/v1/autocomplete.php', {
                    params: {
                        key: API_KEY,
                        q: query,
                        countrycodes: 'VN',
                        format: 'json',
                    },
                });

                if (response.data) {
                    setSuggestions(response.data);
                }
            } catch (error) {
            } finally {
                setLoading(false);
            }
        }, 1000),
        []
    );

    const handleSelectImage = async (type: 'logo' | 'cover') => {
        Alert.alert(
            'Chọn Ảnh',
            'Chọn một tùy chọn',
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
                    text: 'Thư viện',
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
                    text: 'Hủy',
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

            if (type === 'logo') {
                setLogoUrl(imageUrl);
            } else {
                setImageUrl(imageUrl);
            }

            Alert.alert('Thành công', 'Ảnh đã được cập nhật thành công!');
        } catch (error) {
            Alert.alert('Lỗi', 'Tải lên ảnh thất bại');
            console.error(error);
        }
    };

    const handleAddRestaurant = async () => {
        console.log("1  " + title + "2   " + time + "3   " + imageUrl + "4   " + owner + "5     " + code + "6     " + logoUrl + "7     " + latitude + "8     " + longitude + "9     " + address + "10     " + coordTitle);
        if (!title || !time || !imageUrl || !owner || !code || !logoUrl || !latitude || !longitude || !address || !coordTitle) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
            return;
        }

        const restaurantData = {
            title,
            time,
            imageUrl,
            owner,
            code,
            logoUrl,
            coords: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                address,
                title: coordTitle,
            },
            foods,
        };
        console.log(restaurantData);
        try {
            const response = await axios.post(`${API}/api/restaurants`, restaurantData);
            if (response.status === 201) {
                Alert.alert('Thành công', 'Nhà hàng đã được thêm thành công và chờ xác thực.');
                clearDataForm();
            }
            console.log(response.data._id);
            await AsyncStorage.setItem('restaurantId', response.data._id);
            const { verifyVendor } = response.data.verification;
            setVerifyVendor(verifyVendor);
        } catch (error) {
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi thêm nhà hàng.');
        }
    };

    useEffect(() => {
        if (verifyVendor) {
            navigation.navigate('Home');
        }
    }, [ verifyVendor ]);

    const handleSelectSuggestion = async (suggestion: any) => {
        setAddress(suggestion.display_name);
        setLatitude(suggestion.lat);
        setLongitude(suggestion.lon);
        setCode('10000');
        setCoordTitle(suggestion.display_name);
        setSuggestions([]);
    };

    const clearDataForm = () => {
        setTitle('');
        setTime('');
        setImageUrl('');
        setCode('');
        setLogoUrl('');
        setLatitude('');
        setLongitude('');
        setAddress('');
        setCoordTitle('');
        setFoods([]);
        setFoodTag('');
    };

    const handleAddFoodTag = () => {
        if (foodTag) {
            setFoods([ ...foods, foodTag ]);
            setFoodTag('');
        }
    };

    const handleDeleteFoodTag = (index: number) => {
        setFoods(foods.filter((_, i) => i !== index));
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thêm Nhà Hàng</Text>
                <View style={{ width: 24 }} />
            </View>

            {!verifyVendor ? (
                <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
                    <View style={styles.container}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Thông Tin Cơ Bản</Text>
                            <View style={styles.inputContainer}>
                                <Icon name="store" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={title}
                                    onChangeText={setTitle}
                                    placeholder="Tên Nhà Hàng"
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Icon name="access-time" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={time}
                                    onChangeText={setTime}
                                    placeholder="Giờ Hoạt Động"
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>

                        <View style={styles.section}>
                            {/* <Text style={styles.sectionTitle}>Phương Tiện Truyền Thông</Text> */}
                            <View style={styles.imageContainer}>
                                <TouchableOpacity onPress={() => handleSelectImage('cover')}>
                                    <Image
                                        source={{ uri: imageUrl || 'https://example.com/cover.jpg' }}
                                        style={styles.image}
                                    />
                                    <View style={styles.imageOverlay}>
                                        <Icon name="camera-alt" size={24} color="#fff" />
                                        <Text style={styles.changeImageText}>Thay đổi Ảnh Bìa</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.imageContainer}>
                                <TouchableOpacity onPress={() => handleSelectImage('logo')}>
                                    <Image
                                        source={{ uri: logoUrl || 'https://example.com/logo.jpg' }}
                                        style={styles.image}
                                    />
                                    <View style={styles.imageOverlay}>
                                        <Icon name="camera-alt" size={24} color="#fff" />
                                        <Text style={styles.changeImageText}>Thay đổi Logo</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Vị Trí</Text>
                            <View style={styles.inputContainer}>
                                <Icon name="location-on" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={address}
                                    onChangeText={(text) => {
                                        setAddress(text);
                                        handleSearch(text);
                                    }}
                                    placeholder="Tìm kiếm Địa chỉ"
                                    placeholderTextColor="#999"
                                />
                            </View>

                            {loading && (
                                <ActivityIndicator
                                    style={styles.loader}
                                    size="small"
                                    color="#007AFF"
                                />
                            )}

                            {suggestions.length > 0 && (
                                <View style={styles.suggestionsList}>
                                    {suggestions.map((item, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.suggestionItem}
                                            onPress={() => handleSelectSuggestion(item)}
                                        >
                                            <Icon name="place" size={16} color="#666" />
                                            <Text style={styles.suggestionText}>{item.display_name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Món Ăn</Text>
                            <View style={styles.inputContainer}>
                                <Icon name="label" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={foodTag}
                                    onChangeText={setFoodTag}
                                    placeholder="Thẻ Món Ăn"
                                    placeholderTextColor="#999"
                                />
                                <TouchableOpacity onPress={handleAddFoodTag}>
                                    <Icon name="add" size={24} color="#007AFF" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.tagsContainer}>
                                {foods.map((tag, index) => (
                                    <View key={index} style={styles.tag}>
                                        <Text style={styles.tagText}>{tag}</Text>
                                        <TouchableOpacity onPress={() => handleDeleteFoodTag(index)}>
                                            <Icon name="close" size={16} color="#ff0000" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleAddRestaurant}
                        >
                            <Text style={styles.submitButtonText}>Thêm Nhà Hàng</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            ) : (
                <View style={styles.pendingContainer}>
                    <Icon name="hourglass-empty" size={48} color="#007AFF" />
                    <Text style={styles.pendingText}>Đang Chờ Xác Thực</Text>
                    <Text style={styles.pendingSubtext}>Chúng tôi sẽ xem xét yêu cầu của bạn trong thời gian sớm nhất</Text>
                </View>
            )}
        </SafeAreaView>
    );

};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    screen: {
        flex: 1,
    },
    container: {
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#e1e1e1',
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
    },
    loader: {
        marginVertical: 12,
    },
    suggestionsList: {
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    suggestionText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#333',
    },
    submitButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 24,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    pendingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    pendingText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginTop: 16,
    },
    pendingSubtext: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
    },
    imageContainer: {
        marginBottom: 12,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 12,
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    changeImageText: {
        color: '#fff',
        marginTop: 8,
        fontSize: 16,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginVertical: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e1e1e1',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 14,
        color: '#333',
        marginRight: 4,
    },
});

export default AddRestaurantScreen;