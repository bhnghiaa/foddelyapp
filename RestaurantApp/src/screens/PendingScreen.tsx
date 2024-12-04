import { FC } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface Props {
    message?: string;
}

const PendingScreen: FC<Props> = ({ message = 'Nhà hàng đang chờ được duyệt...' }) => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#0066cc" />
            <Text style={styles.title}>Đang chờ xét duyệt</Text>
            <Text style={styles.text}>{message}</Text>
            <Text style={styles.subText}>
                Chúng tôi sẽ thông báo khi nhà hàng được duyệt
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 20,
    },
    title: {
        marginTop: 20,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
    },
    text: {
        marginTop: 12,
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
    },
    subText: {
        marginTop: 8,
        fontSize: 14,
        color: '#888888',
        textAlign: 'center',
    }
});

export default PendingScreen;