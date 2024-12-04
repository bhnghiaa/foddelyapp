import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Easing,
    Dimensions,
    StatusBar,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');
import { FoodItems } from '../@types';
import FoodItem from '../components/FoodItem';
import useFetchSearchFood from '../hook/food/useFetchSearchFood';
import FoodSearchItem from '../components/FoodSearchItem';
import VerticalShimmer from '../components/Shimmers/VerticalShimmer';

const SearchScreen = () => {
    const [ searchQuery, setSearchQuery ] = useState('');
    const [ loading, setLoading ] = useState(false);
    const [ refreshing, setRefreshing ] = useState(false);
    const searchAnimation = useRef(new Animated.Value(0)).current;
    const loadingAnimation = useRef(new Animated.Value(0)).current;
    const { searchFood, loading: loadingSearch, error: errorSearchFood, refetch: refetchSearchFood } = useFetchSearchFood(searchQuery ? searchQuery : 'all');
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            searchFoods();

        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [ searchQuery ]);

    const searchFoods = () => {
        setLoading(true);
        animateLoading(true);
        // Simulate API call
        refetchSearchFood();
        setTimeout(() => {
            setLoading(false);
            animateLoading(false);
        }, 1000);
    };

    const animateSearch = () => {
        Animated.timing(searchAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
        }).start();
    };

    const animateLoading = (show: boolean) => {
        Animated.timing(loadingAnimation, {
            toValue: show ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
        }).start();
    };

    const onRefresh = () => {
        setRefreshing(true);
        // Simulate API call
        setTimeout(() => {
            refetchSearchFood();
            setRefreshing(false);
        }, 1000);
    };

    const renderFoodItem = ({ item, index }: { item: FoodItems; index: number }) => {
        const translateY = new Animated.Value(50);
        const opacity = new Animated.Value(0);

        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                delay: index * 100,
                useNativeDriver: true,
                easing: Easing.out(Easing.ease),
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                delay: index * 100,
                useNativeDriver: true,
            }),
        ]).start();

        return (
            <>
                {loadingSearch && <VerticalShimmer width={'100%'} height={70} radius={18} />}

                {searchFood ? (
                    <Animated.View style={[ styles.foodItem, { opacity, transform: [ { translateY } ] } ]}>
                        <FoodSearchItem item={item} />
                    </Animated.View>
                ) : (
                    <Text style={styles.emptyText}>Không tìm thấy món ăn nào. Hãy thử tìm kiếm khác!</Text>
                )}
            </>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    Khám phá món ngon</Text>
            </View>
            <Animated.View style={styles.searchContainer}>
                <TouchableOpacity onPress={() => searchFoods()}>
                    <Icon name="search-outline" size={24} color="#6C5CE7" style={styles.searchIcon} />
                </TouchableOpacity>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm..."
                    placeholderTextColor="#A0A0A0"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onFocus={animateSearch}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                        <Icon name="close-circle" size={20} color="#6C5CE7" />
                    </TouchableOpacity>
                )}
            </Animated.View>
            <Animated.View
                style={[
                    styles.loadingContainer,
                    {
                        opacity: loadingAnimation,
                        transform: [
                            {
                                translateY: loadingAnimation.interpolate({
                                    inputRange: [ 0, 1 ],
                                    outputRange: [ 20, 0 ],
                                }),
                            },
                        ],
                    },
                ]}
            >
                <Text style={styles.loadingText}>Đang tìm kiếm món ăn ngon...</Text>
            </Animated.View>
            <FlatList
                data={searchFood}
                renderItem={renderFoodItem}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.foodList}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Không tìm thấy món ăn nào. Hãy thử tìm kiếm khác!</Text>
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: COLORS.offwhite,
        borderBottomLeftRadius: 25,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.gray,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 25,
        margin: 16,
        paddingHorizontal: 16,
        elevation: 5,
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#333',
    },
    clearButton: {
        padding: 4,
    },
    loadingContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    loadingText: {
        fontSize: 14,
        color: '#6C5CE7',
        fontStyle: 'italic',
    },
    foodList: {
        paddingHorizontal: 16,
    },
    foodItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    foodImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        margin: 12,
    },
    foodInfo: {
        flex: 1,
    },
    foodName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    foodCalories: {
        fontSize: 14,
        color: '#666',
    },
    addButton: {
        backgroundColor: '#6C5CE7',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
        color: '#666',
        fontStyle: 'italic',
    },
});

export default SearchScreen;