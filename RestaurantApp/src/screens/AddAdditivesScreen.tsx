// AddAdditivesScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useFoodForm } from '../context/FoodFormContext';
import { commonStyles } from '../styles/common';
import { RootStackParamList } from '../@types';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import axios from 'axios'; // Import axios
import { API } from '../constants/api';

export default function AddAdditivesScreen() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { formData, addTag, removeTag, addAdditive, removeAdditive } = useFoodForm();
    const [ newTag, setNewTag ] = useState('');
    const [ additiveName, setAdditiveName ] = useState('');
    const [ additivePrice, setAdditivePrice ] = useState('');
    const [ isSubmitting, setIsSubmitting ] = useState(false);

    const handleAddTag = () => {
        if (newTag.trim()) {
            addTag(newTag.trim());
            setNewTag('');
        }
    };

    const handleAddAdditive = () => {
        if (additiveName.trim() && additivePrice.trim()) {
            addAdditive({
                title: additiveName.trim(),
                price: additivePrice.trim(),
            });
            setAdditiveName('');
            setAdditivePrice('');
        }
    };

    const validateForm = () => {
        if (formData.foodTags.length === 0) {
            Alert.alert('Lỗi', 'Vui lòng thêm ít nhất một thẻ.');
            return false;
        }
        if (formData.additives.length === 0) {
            Alert.alert('Lỗi', 'Vui lòng thêm ít nhất một chất phụ gia.');
            return false;
        }
        return true;
    };

    const clearForm = () => {
        formData.foodTags = [];
        formData.additives = [];
        formData.imageUrl = '';
        formData.title = '';
        formData.category = '';
        formData.code = '';
        formData.restaurant = '';
        formData.description = '';
        formData.time = '';
        formData.price = '';
        setNewTag('');
        setAdditiveName('');
        setAdditivePrice('');
    }
    const { token } = useSelector((state: RootState) => state.user);

    const handleSubmit = async () => {
        console.log('Đang gửi form:', formData);
        // if (!validateForm()) return;

        console.log('Token:', token);
        console.log('Đang gửi form:', formData);
        setIsSubmitting(true);

        try {
            // Thực hiện yêu cầu POST với Axios
            const response = await axios.post(
                `${API}/api/food`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json', // Đảm bảo header đúng định dạng
                    },
                }
            );

            // Kiểm tra nếu trạng thái không phải 200 hoặc 201 (thành công)
            if (response.status !== 200 && response.status !== 201) {
                throw new Error('Gửi thất bại');
            }

            // Thông báo thành công
            Alert.alert('Thành công', 'Món ăn đã được thêm thành công!', [
                {
                    text: 'OK',
                    onPress: () => navigation.navigate('Home'),
                },
            ]);

            // Xóa dữ liệu form
            clearForm();

            // Điều hướng về màn hình Home
            navigation.navigate('Home');
        } catch (error) {
            // Kiểm tra chi tiết lỗi
            if (axios.isAxiosError(error)) {
                Alert.alert('Lỗi', error.response?.data?.message || 'Gửi form thất bại. Vui lòng thử lại.');
            } else {
                Alert.alert('Lỗi', 'Gửi form thất bại. Vui lòng thử lại.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView style={commonStyles.container}>
            <Text style={commonStyles.subtitle}>
                Thêm tags và topping cho món ăn của bạn
            </Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tags</Text>
                <View style={styles.tagInput}>
                    <TextInput
                        style={[ commonStyles.input, styles.flexGrow ]}
                        placeholder="Thêm một tag"
                        value={newTag}
                        onChangeText={setNewTag}
                    />
                    <TouchableOpacity
                        style={[ commonStyles.button, styles.addButton ]}
                        onPress={handleAddTag}
                    >
                        <Text style={commonStyles.buttonText}>Thêm</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.tagContainer}>
                    {formData.foodTags.map((tag, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.tag}
                            onPress={() => removeTag(tag)}
                        >
                            <Text style={styles.tagText}>{tag}</Text>
                            <Text style={styles.removeTag}>×</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Topping</Text>
                <View style={styles.additiveInput}>
                    <TextInput
                        style={[ commonStyles.input, styles.flexGrow ]}
                        placeholder="Tên topping"
                        value={additiveName}
                        onChangeText={setAdditiveName}
                    />
                    <TextInput
                        style={[ commonStyles.input, styles.priceInput ]}
                        placeholder="Giá tiền"
                        value={additivePrice}
                        onChangeText={setAdditivePrice}
                        keyboardType="numeric"
                    />
                    <TouchableOpacity
                        style={[ commonStyles.button, styles.addButton ]}
                        onPress={handleAddAdditive}
                    >
                        <Text style={commonStyles.buttonText}>Thêm</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.additiveList}>
                    {formData.additives.map((additive, index) => (
                        <View key={index} style={styles.additiveItem}>
                            <Text style={styles.additiveName}>{additive.title}</Text>
                            <Text style={styles.additivePrice}>{`₫${additive.price}`}</Text>
                            <TouchableOpacity
                                onPress={() => removeAdditive(index)}
                                style={styles.removeButton}
                            >
                                <Text style={styles.removeButtonText}>×</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View>

            <View style={commonStyles.navigationButtons}>
                <TouchableOpacity
                    style={commonStyles.button}
                    onPress={() => navigation.goBack()}
                    disabled={isSubmitting}
                >
                    <Text style={commonStyles.buttonText}>Quay Lại</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[ commonStyles.button, isSubmitting && styles.disabledButton ]}
                    onPress={() => handleSubmit()}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={commonStyles.buttonText}>Gửi</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    tagInput: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
        alignItems: 'baseline',
    },
    flexGrow: {
        flex: 1,
    },
    addButton: {
        paddingHorizontal: 20,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    tagText: {
        fontSize: 14,
        marginRight: 4,
        color: '#333',
    },
    removeTag: {
        fontSize: 18,
        color: '#666',
    },
    additiveInput: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
        alignItems: 'baseline',
    },
    priceInput: {
        width: 80,
    },
    additiveList: {
        gap: 8,
    },
    additiveItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
    },
    additiveName: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    additivePrice: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 12,
        color: '#333',
    },
    removeButton: {
        padding: 4,
    },
    removeButtonText: {
        fontSize: 20,
        color: '#ff0000',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
});