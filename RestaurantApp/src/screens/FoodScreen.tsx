import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootStackParamList } from '../@types';
import useFetchCategories from '../hook/categoryHook';
import { FlatList } from 'react-native-gesture-handler';
import HorizontalShimmer from '../components/Shimmers/HorizontalShimmer';
import VerticalShimmer from '../components/Shimmers/VerticalShimmer';


interface CategoryItemProps {
    name: string;
    image: string;
    onPress: () => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ name, image, onPress }) => (
    <TouchableOpacity style={styles.categoryItem} onPress={onPress}>
        <View style={styles.categoryIcon}>
            <Image source={{ uri: image }} style={{ width: 30, height: 30 }} />
        </View>
        <Text style={styles.categoryName}>{name}</Text>
        <Icon name="chevron-right" size={20} color="#A0AEC0" />
    </TouchableOpacity>
);

export default function FoodScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { categories, loading, error, refetch: refetchCategories } = useFetchCategories();

    const handleNavFoodList = (categoryId: string) => {
        navigation.navigate('FoodList', { categoryId });
        console.log('categoryId:', categoryId);
    }
    return (
        <SafeAreaView style={[ styles.container, { paddingTop: insets.top } ]}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color="#4A5568" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.title}>Danh sách</Text>
                </View>
            </View>
            {loading ? (
                <VerticalShimmer
                    width={'90%'}
                    height={60} radius={10} />
            ) : (
                <FlatList
                    data={categories}
                    keyExtractor={item => item._id.toString()}
                    style={styles.content}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <CategoryItem
                            name={item.title}
                            image={item.imageUrl}
                            onPress={() => handleNavFoodList(item._id)}
                        />
                    )}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7FAFC',
    },
    header: {
        padding: 16,
        backgroundColor: '#EDF2F7',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        flexDirection: 'row',
        gap: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    backButton: {
        marginBottom: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2D3748',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#4A5568',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2D3748',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#4A5568',
        marginBottom: 16,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    categoryIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EDF2F7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    categoryName: {
        flex: 1,
        fontSize: 16,
        color: '#2D3748',
    },
    footer: {
        height: 100,
        overflow: 'hidden',
    },
    footerImage: {
        width: '100%',
        height: '100%',
    },
});