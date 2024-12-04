import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface MenuItemProps {
    icon: string;
    label: string;
    onPress: () => void;
    isActive: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onPress, isActive }) => {
    return (
        <TouchableOpacity style={[ styles.menuItem, isActive && styles.activeMenuItem ]} onPress={onPress}>
            <Icon name={icon} size={24} color={isActive ? '#FFFFFF' : '#4A4A4A'} />
            <Text style={[ styles.menuItemText, { color: isActive ? '#FFFFFF' : '#4A4A4A' } ]}>{label}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    menuItem: {
        alignItems: 'center',
        marginBottom: 16,
        height: 60,
        width: 75,
        backgroundColor: '#F0F0F0', // Màu nền cho item không được chọn
        borderRadius: 8,
        justifyContent: 'center',
        marginHorizontal: 7,
    },
    activeMenuItem: {
        backgroundColor: '#4CD964', // Màu nền cho item được chọn
    },
    menuItemText: {
        marginTop: 4,
        fontSize: 12,
    },
});

export default MenuItem;
