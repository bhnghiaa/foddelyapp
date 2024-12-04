// components/ConfirmOrderModal.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { formatCurrency } from '../utils/currency';

interface ConfirmOrderModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    totalAmount: number;
    itemCount: number;
    loading?: boolean;
}
const deliveryFee = 5000;
const ConfirmOrderModal = ({
    visible,
    onClose,
    onConfirm,
    totalAmount,
    itemCount,
    loading = false
}: ConfirmOrderModalProps) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Xác nhận đơn hàng</Text>
                    <Text style={styles.modalSubText}>
                        Tổng thanh toán: {formatCurrency(totalAmount)}
                    </Text>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[ styles.modalButton, styles.buttonCancel ]}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Text style={styles.modalButtonText}>Hủy</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[ styles.modalButton, styles.buttonConfirm ]}
                            onPress={onConfirm}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.modalButtonText}>Xác nhận</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
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
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
    },
    modalSubText: {
        marginBottom: 20,
        textAlign: 'center',
        color: '#666',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 15,
    },
    modalButton: {
        borderRadius: 8,
        padding: 10,
        paddingHorizontal: 20,
        elevation: 2,
        minWidth: 100,
        alignItems: 'center',
    },
    buttonCancel: {
        backgroundColor: '#dc3545',
    },
    buttonConfirm: {
        backgroundColor: '#4CAF50',
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default ConfirmOrderModal;