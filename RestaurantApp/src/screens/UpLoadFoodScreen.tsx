import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useFoodForm } from '../context/FoodFormContext';
import { commonStyles } from '../styles/common';
import { RootStackParamList } from '../@types';

export default function UploadScreen() {
    const [ isUploading, setIsUploading ] = useState(false);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { formData, updateFormData } = useFoodForm();

    const uploadImage = async (uri: string) => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', {
                uri,
                type: 'image/jpeg',
                name: 'upload.jpg',
            });
            formData.append('upload_preset', '0');

            const response = await fetch(
                '0',
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const data = await response.json();
            updateFormData({ imageUrl: data.secure_url });
            return data.secure_url;
        } catch (error) {
            Alert.alert('Error', 'Failed to upload image');
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const handleImagePick = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 1,
        });

        if (result.assets && result.assets[ 0 ].uri) {
            await uploadImage(result.assets[ 0 ].uri);
        }
    };

    const handleCamera = async () => {
        const result = await launchCamera({
            mediaType: 'photo',
            quality: 1,
        });

        if (result.assets && result.assets[ 0 ].uri) {
            await uploadImage(result.assets[ 0 ].uri);
        }
    };

    return (
        <View style={commonStyles.container}>
            <Text style={commonStyles.title}>Thêm ảnh món ăn</Text>
            <Text style={commonStyles.subtitle}>

            </Text>

            <View style={styles.imageContainer}>
                {formData.imageUrl ? (
                    <Image
                        source={{ uri: formData.imageUrl }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.placeholder}>
                        <Text style={styles.placeholderText}>No image selected</Text>
                    </View>
                )}
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[ commonStyles.button, styles.uploadButton ]}
                    onPress={handleImagePick}
                    disabled={isUploading}
                >
                    <Text style={commonStyles.buttonText}>Chọn từ thư viện</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[ commonStyles.button, styles.uploadButton ]}
                    onPress={handleCamera}
                    disabled={isUploading}
                >
                    <Text style={commonStyles.buttonText}>Chụp ảnh</Text>
                </TouchableOpacity>
            </View>

            {isUploading && (
                <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
            )}

            <View style={commonStyles.navigationButtons}>
                <TouchableOpacity
                    style={[ commonStyles.button, { opacity: 0 } ]}
                    disabled={true}
                >
                    <Text style={commonStyles.buttonText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        commonStyles.button,
                        !formData.imageUrl && styles.disabledButton,
                    ]}
                    onPress={() => navigation.navigate('AddDetails')}
                    disabled={!formData.imageUrl}
                >
                    <Text style={commonStyles.buttonText}>Tiếp tục</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        borderRadius: 12,
    },
    placeholderText: {
        fontSize: 16,
        color: '#666',
    },
    buttonContainer: {
        gap: 12,
    },
    uploadButton: {
        backgroundColor: '#4CAF50',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    loader: {
        marginTop: 20,
    },
});