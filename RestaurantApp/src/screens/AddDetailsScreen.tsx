import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useFoodForm } from '../context/FoodFormContext';
import { commonStyles } from '../styles/common';
import { RootStackParamList } from '../@types';
import useFetchCategories from '../hook/categoryHook';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function AddDetailsScreen() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { formData, updateFormData } = useFoodForm();
    const [ showCategories, setShowCategories ] = useState(false);
    const { categories } = useFetchCategories();
    const { userId } = useSelector((state: RootState) => state.user);
    console.log(categories.map((category) => category._id));
    const { resId } = useSelector((state: RootState) => state.res);
    const [ restaurantId, setRestaurantId ] = useState<string>(resId);
    console.log("resIDdddd--" + resId);

    const validateForm = () => {
        if (!formData.title.trim()) {
            Alert.alert('Error', 'Please enter a title');
            return false;
        }
        if (!formData.description.trim()) {
            Alert.alert('Error', 'Please enter a description');
            return false;
        }
        if (!formData.category) {
            Alert.alert('Error', 'Please select a category');
            return false;
        }
        if (!formData.code.trim()) {
            Alert.alert('Error', 'Please enter a food code');
            return false;
        }
        // if (!formData.restaurant.trim()) {
        //     Alert.alert('Error', 'Please enter a restaurant name');
        //     return false;
        // }
        updateFormData({ restaurant: resId });
        if (!formData.time.trim()) {
            Alert.alert('Error', 'Please enter preparation time');
            return false;
        }
        if (!formData.price.trim()) {
            Alert.alert('Error', 'Please enter a price');
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (validateForm()) {
            navigation.navigate('AddAdditives');
        }
    };

    return (
        <ScrollView style={commonStyles.container}>
            <Text style={commonStyles.subtitle}>
                Điền các thông tin món ăn
            </Text>

            <View style={styles.form}>
                <TextInput
                    style={commonStyles.input}
                    placeholder="Tên"
                    value={formData.title}
                    onChangeText={(text) => updateFormData({ title: text })}
                />

                <TextInput
                    style={[ commonStyles.input, styles.textArea ]}
                    placeholder="Mô tả"
                    value={formData.description}
                    onChangeText={(text) => updateFormData({ description: text })}
                    multiline
                    numberOfLines={4}
                />

                <TouchableOpacity
                    style={[ commonStyles.input, styles.categoryButton ]}
                    onPress={() => setShowCategories(!showCategories)}
                >
                    <Text style={styles.categoryButtonText}>
                        {formData.category || 'Chọn loại danh mục'}
                    </Text>
                </TouchableOpacity>

                {showCategories && (
                    <View style={styles.categoryList}>
                        {categories.map((category) => (
                            <TouchableOpacity
                                key={category._id}
                                style={styles.categoryItem}
                                onPress={() => {
                                    updateFormData({ category: category._id });
                                    setShowCategories(false);
                                }}
                            >
                                <Text style={styles.categoryItemText}>{category.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <TextInput
                    style={commonStyles.input}
                    placeholder="Mã món ăn (ví dụ: cơm 01, phở 01, ...)"
                    value={formData.code}
                    onChangeText={(text) => updateFormData({ code: text })}
                />

                {/* <TextInput
                    style={commonStyles.input}
                    placeholder="Restaurant Name"
                    value={formData.restaurant}
                    onChangeText={(text) => updateFormData({ restaurant: text })}
                /> */}

                <TextInput
                    style={commonStyles.input}
                    placeholder="Thời gian chuẩn bị (ví dụ, 30 phút)"

                    value={formData.time}
                    onChangeText={(text) => updateFormData({ time: text })}
                />

                <TextInput
                    style={commonStyles.input}
                    placeholder="Giá"
                    value={formData.price}
                    onChangeText={(text) => updateFormData({ price: text })}
                    keyboardType="numeric"
                />
            </View>

            <View style={commonStyles.navigationButtons}>
                <TouchableOpacity
                    style={commonStyles.button}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={commonStyles.buttonText}>Quay lại</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={commonStyles.button}
                    onPress={handleNext}
                >
                    <Text style={commonStyles.buttonText}>Tiếp tục</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    form: {
        gap: 12,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    categoryButton: {
        justifyContent: 'center',
    },
    categoryButtonText: {
        fontSize: 16,
        color: '#000',
    },
    categoryList: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginTop: -8,
        marginBottom: 8,
    },
    categoryItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    categoryItemText: {
        fontSize: 16,
        color: '#000',
    },
});