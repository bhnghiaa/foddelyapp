import React, { FC } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Image, Alert } from 'react-native';
import useFetchCategories from '../hook/useFetchCategories';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import { useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hook/categoryHooks';
import axios from 'axios';
import { CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_URL } from '../constants/api';

interface Category {
    _id: string;
    title: string;
    imageUrl: string;
}


const Categories: FC = () => {
    const { categories, loading, error, refreshCategories } = useFetchCategories();
    const { createCategory, loading: creating, error: createError } = useCreateCategory();
    const { updateCategory, loading: updating, error: updateError } = useUpdateCategory();
    const { deleteCategory, loading: deleting, error: deleteError } = useDeleteCategory();

    const [ modalVisible, setModalVisible ] = React.useState(false);
    const [ currentCategory, setCurrentCategory ] = React.useState<Category | null>(null);
    const [ title, setTitle ] = React.useState('');
    const [ imageUrl, setImageUrl ] = React.useState('');

    const handleAdd = async () => {
        const newCategory = await createCategory(title, '', imageUrl);
        if (newCategory) {
            refreshCategories();
            Alert.alert('Thành công', 'Thêm danh mục thành công.');
        } else {
            Alert.alert('Lỗi', createError || 'Đã xảy ra lỗi không xác định.');
        }
        setModalVisible(false);
        setTitle('');
        setImageUrl('');
    };

    const handleEdit = (category: Category) => {
        setCurrentCategory(category);
        setTitle(category.title);
        setImageUrl(category.imageUrl);
        setModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        Alert.alert(
            "Xác nhận Xóa",
            "Bạn có chắc chắn muốn xóa danh mục này không?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa", onPress: async () => {
                        const success = await deleteCategory(id);
                        if (success) {
                            refreshCategories();
                            Alert.alert('Thành công', 'Xóa danh mục thành công.');
                        } else {
                        }
                    }, style: "destructive"
                }
            ]
        );
    };

    const handleSelectImage = () => {
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
                                await uploadImage(image);
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
                                await uploadImage(image);
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
            const newImageUrl = res.data.secure_url;
            setImageUrl(newImageUrl);
        } catch (error: any) {
            Alert.alert('Tải lên thất bại', error.message);
        }
    };

    const submitCategory = async () => {
        if (title.trim() === '' || imageUrl.trim() === '') {
            Alert.alert("Lỗi Xác thực", "Tiêu đề và URL Ảnh là bắt buộc.");
            return;
        }
        if (currentCategory) {
            const updated = await updateCategory(currentCategory._id, title, '', imageUrl);
            if (updated) {
                refreshCategories();
                Alert.alert('Thành công', 'Cập nhật danh mục thành công.');
            } else {
            }
        } else {
            await handleAdd();
        }
        setModalVisible(false);
        setTitle('');
        setImageUrl('');
        setCurrentCategory(null);
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={categories}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <TouchableOpacity onPress={handleSelectImage}>
                            <Image source={{ uri: item.imageUrl }} style={styles.image} />
                        </TouchableOpacity>
                        <Text style={styles.title}>{item.title}</Text>
                        <View style={styles.buttons}>
                            <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editButton}>
                                <Text style={styles.buttonText}>Chỉnh sửa</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteButton}>
                                <Text style={styles.buttonText}>Xóa</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>Không có Danh Mục nào</Text>}
                contentContainerStyle={styles.listContainer} // Added paddingBottom
            />
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
                <Text style={styles.addButtonText}>+ Thêm Danh Mục</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modal}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{currentCategory ? 'Chỉnh sửa Danh Mục' : 'Thêm Danh Mục'}</Text>
                        <TouchableOpacity onPress={handleSelectImage}>
                            {imageUrl ? (
                                <Image source={{ uri: imageUrl }} style={styles.selectedImage} />
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <Text>Chọn Ảnh</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TextInput
                            style={styles.input}
                            placeholder="Tiêu đề Danh Mục"
                            value={title}
                            onChangeText={setTitle}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={submitCategory} style={styles.submitButton}>
                                <Text style={styles.buttonText}>Gửi</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                setModalVisible(false);
                                setCurrentCategory(null);
                                setTitle('');
                                setImageUrl('');
                            }} style={styles.cancelButton}>
                                <Text style={styles.buttonText}>Hủy</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f9f9f9',
    },
    listContainer: {
        paddingTop: 8,
        paddingBottom: 100, // Added padding to prevent overlap with addButton
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        marginVertical: 6,
        borderRadius: 8,
        elevation: 2,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 12,
    },
    title: {
        flex: 1,
        fontSize: 18,
        color: '#333',
    },
    buttons: {
        flexDirection: 'row',
    },
    editButton: {
        backgroundColor: '#ffc107',
        padding: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        padding: 8,
        borderRadius: 4,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: '#28a745',
        padding: 16,
        borderRadius: 50,
        alignItems: 'center',
        position: 'absolute',
        bottom: 30,
        right: 30,
        elevation: 5,
        zIndex: 1000, // Ensure the button is on top
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modal: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        margin: 20,
        padding: 20,
        borderRadius: 8,
    },
    modalTitle: {
        fontSize: 20,
        marginBottom: 12,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    input: {
        borderBottomWidth: 1,
        borderColor: '#ccc',
        marginBottom: 16,
        padding: 8,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    submitButton: {
        backgroundColor: '#007bff',
        padding: 12,
        borderRadius: 4,
        flex: 1,
        marginRight: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#6c757d',
        padding: 12,
        borderRadius: 4,
        flex: 1,
        marginLeft: 8,
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
        fontSize: 16,
    },
    selectedImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginBottom: 16,
        alignSelf: 'center',
    },
    imagePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 8,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        alignSelf: 'center',
    },
});

export default Categories;