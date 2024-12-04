import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

interface PhoneVerificationModalProps {
    visible: boolean;
    onClose: () => void;
    onVerify: () => void;
}

const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
    visible,
    onClose,
    onVerify,
}) => {
    const benefits = [
        'Real-time updates on order status',
        'Direct communication with verified number',
        'Enhanced security: Protect your account and confirm orders securely',
        'Simplified addressing: Easily address issues with a quick call',
        'Exclusive Offers: Stay in the loop for special deals and promotions',
    ];

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.centeredView} onPress={onClose}>
                <TouchableOpacity style={styles.modalView}>
                    <Text style={styles.modalTitle}>Verify Your Phone Number</Text>
                    <ScrollView style={styles.benefitsList}>
                        {benefits.map((benefit, index) => (
                            <View key={index} style={styles.benefitItem}>
                                <Icon name="checkmark-circle" size={24} color="#4CAF50" style={styles.checkIcon} />
                                <Text style={styles.benefitText}>{benefit}</Text>
                            </View>
                        ))}
                    </ScrollView>
                    <TouchableOpacity style={styles.verifyButton} onPress={onVerify}>
                        <Text style={styles.verifyButtonText}>Verify Phone Number</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: width * 0.9,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',

    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#20B2AA',
        marginBottom: 15,
    },
    benefitsList: {
        width: '100%',
        marginBottom: 20,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    checkIcon: {
        marginRight: 10,
    },
    benefitText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    verifyButton: {
        backgroundColor: '#20B2AA',
        borderRadius: 10,
        padding: 15,
        width: '100%',
        alignItems: 'center',
    },
    verifyButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default PhoneVerificationModal;