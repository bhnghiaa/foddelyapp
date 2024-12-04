import { FC, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Animated, // Add this
    LayoutAnimation, // Add this
    Platform,
    UIManager
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import useFetchFoods from '../hook/useFetchFoods';
import { formatCurrency } from '../utils/currency';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const Foods: FC = () => {
    const { foods } = useFetchFoods();
    const [ expandedRestaurants, setExpandedRestaurants ] = useState<string[]>([]);
    const rotationAnimations = useRef<{ [ key: string ]: Animated.Value }>({});
    const fadeAnimations = useRef<{ [ key: string ]: Animated.Value[] }>({});

    // Initialize rotation values for each restaurant
    const getRotationValue = (restaurantTitle: string) => {
        if (!rotationAnimations.current[ restaurantTitle ]) {
            rotationAnimations.current[ restaurantTitle ] = new Animated.Value(0);
        }
        return rotationAnimations.current[ restaurantTitle ];
    };

    // Initialize fade and slide animations for each restaurant
    const getItemAnimations = (restaurantTitle: string, itemCount: number) => {
        if (!fadeAnimations.current[ restaurantTitle ]) {
            fadeAnimations.current[ restaurantTitle ] = Array(itemCount)
                .fill(0)
                .map(() => new Animated.Value(0));
        }
        return fadeAnimations.current[ restaurantTitle ];
    };

    const groupedFoods = foods.reduce((groups, food) => {
        const restaurantTitle = food.restaurant.title;
        if (!groups[ restaurantTitle ]) {
            groups[ restaurantTitle ] = [];
        }
        groups[ restaurantTitle ].push(food);
        return groups;
    }, {} as Record<string, typeof foods>);

    const sortedRestaurants = Object.keys(groupedFoods).sort();

    const toggleRestaurant = (restaurantTitle: string) => {
        // Configure animation
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        const isExpanding = !expandedRestaurants.includes(restaurantTitle);
        const items = groupedFoods[ restaurantTitle ];
        const animations = getItemAnimations(restaurantTitle, items.length);

        // Rotate arrow animation
        Animated.timing(getRotationValue(restaurantTitle), {
            toValue: isExpanding ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();

        // Animate food items
        if (isExpanding) {
            animations.forEach((anim, index) => {
                Animated.spring(anim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    delay: index * 50, // Stagger effect
                    useNativeDriver: true,
                }).start();
            });
        } else {
            animations.forEach(anim => {
                Animated.timing(anim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }).start();
            });
        }

        setExpandedRestaurants(prev =>
            isExpanding
                ? [ ...prev, restaurantTitle ]
                : prev.filter(r => r !== restaurantTitle)
        );
    };

    // Update the render method, replace the Icon for expand/collapse with:
    const renderArrowIcon = (restaurantTitle: string) => {
        const rotateValue = getRotationValue(restaurantTitle).interpolate({
            inputRange: [ 0, 1 ],
            outputRange: [ '0deg', '180deg' ]
        });

        return (
            <Animated.View style={{ transform: [ { rotate: rotateValue } ] }}>
                <Icon name="expand-more" size={24} color="#333" />
            </Animated.View>
        );
    };

    return (
        <View style={styles.mainContainer}>
            <ScrollView style={styles.container}>
                {sortedRestaurants.map((restaurantTitle) => (
                    <View key={restaurantTitle}>
                        <TouchableOpacity
                            style={styles.restaurantHeader}
                            onPress={() => toggleRestaurant(restaurantTitle)}
                        >
                            <View style={styles.restaurantHeaderLeft}>
                                <Icon name="store" size={20} color="#333" />
                                <Text style={styles.restaurantTitle}>{restaurantTitle}</Text>
                            </View>
                            {renderArrowIcon(restaurantTitle)}
                        </TouchableOpacity>

                        {expandedRestaurants.includes(restaurantTitle) && (
                            <Animated.View>
                                {groupedFoods[ restaurantTitle ].map((food, index) => {
                                    const animation = getItemAnimations(restaurantTitle, groupedFoods[ restaurantTitle ].length)[ index ];

                                    return (
                                        <Animated.View
                                            key={index}
                                            style={{
                                                opacity: animation,
                                                transform: [ {
                                                    translateY: animation.interpolate({
                                                        inputRange: [ 0, 1 ],
                                                        outputRange: [ 50, 0 ],
                                                    })
                                                } ]
                                            }}
                                        >
                                            <TouchableOpacity style={styles.card}>
                                                <Image source={{ uri: food.imageUrl }} style={styles.image} />
                                                <View style={styles.contentContainer}>
                                                    <View style={styles.headerContainer}>
                                                        <Text style={styles.title} numberOfLines={1}>{food.title}</Text>
                                                        <Text style={styles.price}>{formatCurrency(food.price)}</Text>
                                                    </View>

                                                    <View style={styles.infoContainer}>
                                                        <View style={styles.infoRow}>
                                                            <Icon name="category" size={16} color="#666" />
                                                            <Text style={styles.infoText}>{food.category.title}</Text>
                                                        </View>

                                                        {food.additives.length > 0 && (
                                                            <View style={styles.infoRow}>
                                                                <Icon name="info" size={16} color="#666" />
                                                                <Text style={styles.infoText} numberOfLines={2}>
                                                                    {food.additives.map(additive => additive.title).join(', ')}
                                                                </Text>
                                                            </View>
                                                        )}

                                                        <View style={styles.statusRow}>
                                                            <Text style={[
                                                                styles.status,
                                                                { color: food.isAvailable ? '#2ecc71' : '#e74c3c' }
                                                            ]}>
                                                                {food.isAvailable ? 'Đang bán' : 'Tạm dừng bán'}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        </Animated.View>
                                    );
                                })}
                            </Animated.View>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        padding: 12,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 12,
        elevation: 2,
        overflow: 'hidden',
    },
    image: {
        width: 120,
        height: 120,
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        resizeMode: 'cover',
    },
    imageContainer: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    contentContainer: {
        flex: 1,
        padding: 12,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 8,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2ecc71',
    },
    infoContainer: {
        flex: 1,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    statusRow: {
        marginTop: 4,
    },
    status: {
        fontSize: 14,
        fontWeight: '500',
    },
    restaurantHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: '#f8f9fa',
        marginBottom: 8,
        borderRadius: 8,
    },
    restaurantTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
        color: '#333',
    },
    restaurantHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    }
});

export default Foods;