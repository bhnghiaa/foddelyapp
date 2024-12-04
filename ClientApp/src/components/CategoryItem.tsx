import React, { useEffect, useRef, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { COLORS } from '../constants/theme';

interface CategoryItemProps {
    name: string;
    image: string;
    isSelected: boolean;
    onPress: () => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ name, image, isSelected, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const bgColorAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: isSelected ? 1.05 : 1, // Giảm scale để animation mượt hơn
                friction: 3, // Giảm friction để phản hồi nhanh hơn
                useNativeDriver: false,
            }),
            Animated.timing(bgColorAnim, {
                toValue: isSelected ? 1 : 0,
                duration: 200, // Giảm duration để animation nhanh hơn
                useNativeDriver: false,
            }),
        ]).start();
    }, [ isSelected ]);

    const backgroundColor = bgColorAnim.interpolate({
        inputRange: [ 0, 1 ],
        outputRange: [ '#f8f8f8', COLORS.offwhite ],
    });

    return (
        <TouchableOpacity onPress={onPress}>
            <Animated.View
                style={[
                    styles.categoryItem,
                    { transform: [ { scale: scaleAnim } ], backgroundColor },
                    isSelected && styles.categoryItemSelected,
                ]}
            >
                <View style={styles.categoryIcon}>
                    <Image source={{ uri: image }} style={{ width: 30, height: 30 }} />
                </View>
                <Text style={styles.categoryText}>{name}</Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

export default memo(CategoryItem);

const styles = StyleSheet.create({
    categoryItem: {
        alignItems: 'center',
        marginRight: 20,
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#f8f8f8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    categoryItemSelected: {
        borderWidth: 2,
        borderColor: COLORS.primary1,
    },
    categoryIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e0f7fa',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryText: {
        fontSize: 14,
    },
});
