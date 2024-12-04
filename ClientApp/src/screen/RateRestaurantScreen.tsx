import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Image,
    ScrollView,
    Dimensions,
    Alert,
    Platform,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { launchImageLibrary, launchCamera, MediaType, PhotoQuality } from 'react-native-image-picker';
import { Camera, Image as ImageIcon, Star, X } from 'lucide-react-native';
import useAddReview from '../hook/rating/useAddReview';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../@types';
import useFetchUser from '../hook/user/useFetchUser';
import useGetReview from '../hook/rating/useGetReview';
import useUpdateRating from '../hook/restaurant/useUpdate';

const { width } = Dimensions.get('window');

const uploadImageToCloudinary = async (imageUri: string) => {
    const data = new FormData();
    data.append('file', { uri: imageUri, type: 'image/jpeg', name: 'upload.jpg' });
    data.append('upload_preset', '0');

    try {
        const response = await fetch('0', {
            method: 'POST',
            body: data,
        });
        const result = await response.json();
        return result.secure_url;
    } catch (error) {
        return null;
    }
};

export default function RateRestaurantScreen() {
    const [ rating, setRating ] = useState(0);
    const [ review, setReview ] = useState('');
    const [ images, setImages ] = useState<string[]>([]);
    const animatedButtonScale = useRef(new Animated.Value(1)).current;
    const { user } = useFetchUser();
    const route = useRoute<RouteProp<RootStackParamList, 'Restaurant'>>();
    const restaurant = route.params.restaurant;
    const { reviews, refetch, averageRating } = useGetReview('Restaurant', restaurant);
    console.log(averageRating, "averageRating");
    const { updateRating, loading } = useUpdateRating();
    const animatedValues = useRef(Array(5).fill(0).map(() => new Animated.Value(1))).current;
    const { addReview, loading: addReviewLoading, error, success } = useAddReview();
    const [ hasRunEffect, setHasRunEffect ] = useState(false);

    const handleStarPress = (selectedRating: number) => {
        setRating(selectedRating);
        animatedValues.forEach((value, index) => {
            Animated.sequence([
                Animated.timing(value, {
                    toValue: index < selectedRating ? 0.8 : 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.spring(value, {
                    toValue: 1,
                    friction: 4,
                    useNativeDriver: true,
                }),
            ]).start();
        });
    };

    const handleAddPhoto = () => {
        const options = {
            mediaType: 'photo' as MediaType, // Explicitly specify the type
            quality: 1 as PhotoQuality,
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
            } else if (response.errorCode) {
                console.error('Image Picker Error: ', response.errorMessage);
            } else if (response.assets && response.assets[ 0 ]?.uri) {
                setImages([ ...images, response.assets[ 0 ].uri ]);
            } else {
            }
        });
    };
    const handleTakePhoto = () => {
        launchCamera({ mediaType: 'photo', quality: 1, saveToPhotos: true, cameraType: 'back' }, (response) => {
            if (response?.assets && response.assets[ 0 ]?.uri) {
                setImages([ ...images, response.assets[ 0 ].uri ]);
            }
        });
    };

    const handleRemoveImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const clearForm = () => {
        setRating(0);
        setReview('');
        setImages([]);
    }
    const calculateAverageRating = (rate: number) => {
        return (averageRating !== null && !isNaN(averageRating) ? (averageRating * reviews.length + rate) / (reviews.length + 1) : rate);
    }
    const handleSubmit = async () => {
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

        if (!rating) {
            Alert.alert('Please select a rating.');
            return;
        }

        const uploadedImageUrls = [];
        for (const image of images) {
            const imageUrl = await uploadImageToCloudinary(image);
            if (imageUrl) {
                uploadedImageUrls.push(imageUrl);
            }
        }

        if (user) {
            const reviewData = {
                userId: user,
                itemId: restaurant,
                itemType: 'Restaurant',
                rating,
                review,
                photos: uploadedImageUrls,
            };
            try {
                await addReview(reviewData);

            } catch (error) {
            }
        } else {
            Alert.alert('Error', 'User not found. Please log in.');
        }
    };

    useEffect(() => {
        if (success && !hasRunEffect) {
            // Reset form
            console.log('success', calculateAverageRating(rating));
            updateRating(restaurant._id, calculateAverageRating(rating), reviews.length + 1);
            clearForm();
            Alert.alert('Success', 'Your review has been submitted!');
            setHasRunEffect(true); // Đánh dấu rằng useEffect đã chạy
        } else if (error) {
            Alert.alert('Error', 'Failed to submit review. Please try again.');
        }
    }, [ success, hasRunEffect ]);
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={[ '#2c3e50', '#b9c8d3' ]}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <Text style={styles.headerTitle}>Đánh giá nhà hàng</Text>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={addReviewLoading}
                        onRefresh={clearForm}
                        colors={[ '#3498db' ]}
                    />
                }
            >
                <View style={styles.ratingContainer}>
                    <Text style={styles.sectionTitle}>Bạn thấy nhà hàng thế nào?</Text>
                    <View style={styles.starsContainer}>
                        {Array(5).fill(0).map((_, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleStarPress(index + 1)}
                                style={styles.starButton}
                            >
                                <Animated.View style={{ transform: [ { scale: animatedValues[ index ] } ] }}>
                                    <Star
                                        size={40}
                                        color="#FFD700"
                                        fill={rating > index ? "#FFD700" : "transparent"}
                                        strokeWidth={1.5}
                                    />
                                </Animated.View>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={styles.ratingText}>
                        {rating === 0 ? 'Chọn đánh giá của bạn' :
                            rating === 1 ? 'Rất tệ' :
                                rating === 2 ? 'Không hài lòng' :
                                    rating === 3 ? 'Bình thường' :
                                        rating === 4 ? 'Hài lòng' : 'Tuyệt vời'}
                    </Text>
                </View>

                <View style={styles.reviewContainer}>
                    <TextInput
                        style={styles.reviewInput}
                        placeholder="Chia sẻ trải nghiệm của bạn về nhà hàng..."
                        placeholderTextColor="#999"
                        multiline
                        value={review}
                        onChangeText={setReview}
                        textAlignVertical="top"
                    />
                </View>

                {images.length > 0 && (
                    <View style={styles.imageGridContainer}>
                        {images.map((image, index) => (
                            <Animated.View key={index} style={styles.imagePreview}>
                                <Image source={{ uri: image }} style={styles.previewImage} />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => handleRemoveImage(index)}
                                >
                                    <X size={16} color="#fff" />
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                )}

                <View style={styles.photoButtons}>
                    <TouchableOpacity
                        style={styles.photoButton}
                        onPress={handleAddPhoto}
                    >
                        <LinearGradient
                            colors={[ '#3498db', '#2980b9' ]}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <ImageIcon size={24} color="#fff" />
                            <Text style={styles.buttonText}>Thêm ảnh</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.photoButton}
                        onPress={handleTakePhoto}
                    >
                        <LinearGradient
                            colors={[ '#e74c3c', '#c0392b' ]}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Camera size={24} color="#fff" />
                            <Text style={styles.buttonText}>Chụp ảnh</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={handleSubmit}>
                    <Animated.View style={[ styles.submitButton, { transform: [ { scale: animatedButtonScale } ] } ]}>
                        <LinearGradient
                            colors={[ '#27ae60', '#219a52' ]}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {addReviewLoading && loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
                            )}
                        </LinearGradient>
                    </Animated.View>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        padding: 20,
        // borderBottomLeftRadius: 20,
        // borderBottomRightRadius: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 16,
        textAlign: 'center',
    },
    ratingContainer: {
        marginBottom: 30,
        alignItems: 'center',
    },
    ratingText: {
        marginTop: 12,
        fontSize: 18,
        color: '#666',
        fontWeight: '500',
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    starButton: {
        padding: 8,
    },
    reviewContainer: {
        marginBottom: 30,
    },
    reviewInput: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 16,
        height: 150,
        borderWidth: 1,
        borderColor: '#e1e1e1',
        fontSize: 16,
        color: '#333',
        textAlignVertical: 'top',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    imageGridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
        gap: 10,
    },
    imagePreview: {
        position: 'relative',
        width: (width - 50) / 3,
        aspectRatio: 1,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#ff4444',
        borderRadius: 12,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    photoButtons: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 30,
    },
    photoButton: {
        flex: 1,
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        gap: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    submitButton: {
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});
