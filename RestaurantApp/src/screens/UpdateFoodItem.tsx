import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Animated, Image, ActivityIndicator, Switch } from 'react-native';
import { Additive, FoodItems, RootStackParamList } from '../@types';
import useUpdateFood from '../hook/useUpdateFood';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary, launchCamera, ImagePickerResponse } from 'react-native-image-picker';

const uploadImageToCloudinary = async (imageUri: string): Promise<string | null> => {
    if (!imageUri) return null;

    const data = new FormData();
    data.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'upload.jpg'
    } as any);
    data.append('upload_preset', '0');

    try {
        const response = await fetch('0', {
            method: 'POST',
            body: data,
        });
        const result = await response.json();
        return result.secure_url;
    } catch (error) {
        console.error('Image upload error:', error);
        return null;
    }
};

interface Props { }

const UpdateFoodItem: FC<Props> = () => {
    const route = useRoute<RouteProp<RootStackParamList, 'Food'>>();
    const foodItem = route.params.foodItem;
    const { updateFood, loading, error } = useUpdateFood();
    const [ foodData, setFoodData ] = useState<FoodItems>(foodItem);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [ images, setImages ] = useState<string[]>([]);
    const [ isUploading, setIsUploading ] = useState(false);
    const animatedButtonScale = useRef(new Animated.Value(1)).current;

    const handleAddPhoto = useCallback(() => {
        launchImageLibrary({
            mediaType: 'photo',
            quality: 1
        }, (response: ImagePickerResponse) => {
            if (response.assets?.[ 0 ]?.uri) {
                setImages(prevImages => [ ...prevImages, response.assets[ 0 ].uri ]);
            }
        });
    }, []);

    const handleTakePhoto = useCallback(() => {
        launchCamera({
            mediaType: 'photo',
            quality: 1,
            saveToPhotos: true,
            cameraType: 'back'
        }, (response: ImagePickerResponse) => {
            if (response.assets?.[ 0 ]?.uri) {
                setImages(prevImages => [ ...prevImages, response.assets[ 0 ].uri ]);
            }
        });
    }, []);

    const handleRemoveImage = useCallback((index: number) => {
        setImages(prevImages => prevImages.filter((_, i) => i !== index));
    }, []);

    const validateForm = (): boolean => {
        if (!foodData.title?.trim() || !foodData.code?.trim() || !foodData.description?.trim()) {
            Alert.alert('Lỗi', 'Tiêu đề, Mã và Mô tả là bắt buộc.');
            return false;
        }

        const invalidAdditive = foodData.additives.find(
            add => (add.title && !add.price) || (!add.title && add.price)
        );

        if (invalidAdditive) {
            Alert.alert('Lỗi', 'Tất cả các trường phụ gia là bắt buộc.');
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setIsUploading(true);

        try {
            // Animate button
            Animated.sequence([
                Animated.timing(animatedButtonScale, {
                    toValue: 0.95,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedButtonScale, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]).start();

            // Upload images
            const uploadedImageUrls = await Promise.all(
                images.map(image => uploadImageToCloudinary(image))
            );

            const validUrls = uploadedImageUrls.filter((url): url is string => url !== null);

            const updatedFoodData = {
                ...foodData,
                imageUrl: validUrls[ 0 ] || foodData.imageUrl,
                price: Number(foodData.price) || 0,
                time: foodData.time.toString() || '0',
            };

            const result = await updateFood(updatedFoodData._id, updatedFoodData);

            if (result) {
                Alert.alert(
                    'Thành công',
                    'Món ăn đã được cập nhật thành công!',
                    [ { text: 'OK', onPress: () => navigation.goBack() } ],
                    { cancelable: false }
                );
            } else {
                throw new Error('Cập nhật thất bại');
            }
        } catch (err) {
            Alert.alert('Lỗi', 'Không thể cập nhật món ăn.');
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    };

    const addAdditive = () => {
        const newAdditive: Additive = {
            id: Date.now(),
            title: '',
            price: '',
        };
        setFoodData(prevData => ({ ...prevData, additives: [ ...prevData.additives, newAdditive ] }));
    };

    // Delete an additive
    const deleteAdditive = (id: number) => {
        Alert.alert(
            'Xác nhận xóa',
            'Bạn có chắc chắn muốn xóa phụ gia này không?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'OK',
                    onPress: () => {
                        setFoodData(prevData => ({
                            ...prevData,
                            additives: prevData.additives.filter(add => add.id !== id)
                        }));
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const handleAdditiveChange = (id: number, field: keyof Additive, value: string) => {
        setFoodData(prevData => ({
            ...prevData,
            additives: prevData.additives.map(add => add.id === id ? { ...add, [ field ]: value } : add)
        }));
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Tiêu đề</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Tiêu đề"
                    value={foodData.title}
                    onChangeText={(text) => setFoodData(prevData => ({ ...prevData, title: text }))}
                />

                <Text style={styles.label}>Thẻ món ăn</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Thẻ món ăn (ngăn cách bằng dấu phẩy)"
                    value={foodData.foodTags.join(', ')}
                    onChangeText={(text) =>
                        setFoodData(prevData => ({
                            ...prevData,
                            foodTags: text.split(',').map(tag => tag.trim())
                        }))
                    }
                />

                <Text style={styles.label}>Mã</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Mã"
                    value={foodData.code}
                    onChangeText={(text) => setFoodData(prevData => ({ ...prevData, code: text }))}
                />

                <Text style={styles.label}>Mô tả</Text>
                <TextInput
                    style={[ styles.input, styles.textArea ]}
                    placeholder="Mô tả"
                    value={foodData.description}
                    onChangeText={(text) => setFoodData(prevData => ({ ...prevData, description: text }))}
                    multiline
                    numberOfLines={4}
                />

                <Text style={styles.label}>Thời gian (phút)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Thời gian (phút)"
                    value={foodData.time.toString()}
                    onChangeText={(text) => {
                        const time = parseInt(text, 10);
                        setFoodData(prevData => ({ ...prevData, time: isNaN(time) ? '0' : text }));
                    }}
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Giá (đ)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Giá (đ)"
                    value={foodData.price.toString()}
                    onChangeText={(text) => {
                        const price = parseFloat(text);
                        setFoodData(prevData => ({ ...prevData, price: isNaN(price) ? 0 : price }));
                    }}
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Phụ gia</Text>
                {foodData.additives.map((additive) => (
                    <View key={additive.id} style={styles.additiveContainer}>
                        <TextInput
                            style={[ styles.input, styles.additiveInput ]}
                            placeholder="Tiêu đề"
                            value={additive.title}
                            onChangeText={(text) => handleAdditiveChange(additive.id, 'title', text)}
                        />
                        <TextInput
                            style={[ styles.input, styles.additiveInput ]}
                            placeholder="Giá (đ)"
                            value={additive.price}
                            onChangeText={(text) => handleAdditiveChange(additive.id, 'price', text)}
                            keyboardType="numeric"
                        />
                        <TouchableOpacity onPress={() => deleteAdditive(additive.id)} style={styles.iconButton}>
                            <Ionicons name="remove-circle-outline" size={24} color="#f44336" />
                        </TouchableOpacity>
                    </View>
                ))}

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={addAdditive}
                    activeOpacity={0.7}
                >
                    <Ionicons name="add-circle-outline" size={24} color="green" />
                    <Text style={styles.addButtonText}>Thêm phụ gia</Text>
                </TouchableOpacity>

                <Text style={styles.label}>Hình ảnh</Text>
                {/* Display selected images */}
                {images.length > 0 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.imagePreviewContainer}
                    >
                        {images.map((image, index) => (
                            <View key={image} style={styles.imagePreview}>
                                <Image source={{ uri: image }} style={styles.previewImage} />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => handleRemoveImage(index)}
                                >
                                    <Ionicons name="close-circle" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                )}

                {/* Add Image Buttons */}
                <View style={styles.photoButtons}>
                    <TouchableOpacity
                        style={[ styles.photoButton, styles.addPhotoButton ]}
                        onPress={handleAddPhoto}
                    >
                        <Ionicons name="image-outline" size={24} color="#fff" />
                        <Text style={styles.buttonText}>Thêm ảnh</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[ styles.photoButton, styles.takePhotoButton ]}
                        onPress={handleTakePhoto}
                    >
                        <Ionicons name="camera-outline" size={24} color="#fff" />
                        <Text style={styles.buttonText}>Chụp ảnh</Text>
                    </TouchableOpacity>
                </View>

                {/* Availability Switch */}
                <View style={styles.switchContainer}>
                    <Text style={styles.statusText}>Trạng thái</Text>
                    <Switch
                        value={foodData.isAvailable}
                        onValueChange={(value) => setFoodData(prevData => ({ ...prevData, isAvailable: value }))}
                    />
                    <Text style={styles.switchText}>{foodData.isAvailable ? 'Sẵn sàng' : 'Hết hàng'}</Text>
                </View>

                {/* Save Button */}
                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Lưu</Text>}
                </TouchableOpacity>
                {error && <Text style={styles.errorText}>{error}</Text>}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
        padding: 16,
    },
    scrollContainer: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
        marginBottom: 5,
        marginTop: 15,
    },
    statusText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        fontSize: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    additiveInputs: {
        flex: 1,
        flexDirection: 'row',
    },
    saveButton: {
        backgroundColor: '#2196F3',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    errorText: {
        color: '#f44336',
        textAlign: 'center',
        marginTop: 10,
        fontSize: 14,
    },
    additiveContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    additiveInput: {
        flex: 1,
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#f9f9f9',
        fontSize: 14,
        marginRight: 5,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        borderRadius: 24,
        justifyContent: 'flex-end',
    },
    addButtonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    iconButton: {
        padding: 5,
    },
    imagePreviewContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        paddingTop: 8,
    },
    imagePreview: {
        marginRight: 12,
        position: 'relative',
    },
    previewImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#ff4444',
        borderRadius: 12,
        padding: 4,
    },
    photoButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    photoButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    addPhotoButton: {
        backgroundColor: '#4a90e2',
    },
    takePhotoButton: {
        backgroundColor: '#ff7675',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    switchText: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
    },
});

export default UpdateFoodItem;