import { FC, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import getPaymentHistory from '../services/paymentService';

interface Props { }
const PaymentHistoryScreen: FC<Props> = (props) => {
    const { payment, loading, error, refetch } = getPaymentHistory();
    useEffect(() => {
        console.log(payment);
    }, []);
    return <View style={styles.container}><Text>PaymentHistoryScreen</Text></View>;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default PaymentHistoryScreen;