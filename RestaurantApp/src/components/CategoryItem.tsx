import React, { useEffect, useRef, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { COLORS } from '../constants/theme';

interface CategoryItemProps {
    name: string;
    image: string;
    onPress: () => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ name, image, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const bgColorAnim = useRef(new Animated.Value(0)).current;

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
