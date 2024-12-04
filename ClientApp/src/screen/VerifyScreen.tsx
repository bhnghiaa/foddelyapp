import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../@types';
import useVerifyAccount from '../hook/user/verifyOTP';
import useFetchUser from '../hook/user/useFetchUser';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

export default function VerifyScreen() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [ otp, setOtp ] = useState('');
    const { verifyAccount, loading, error, sendOTP } = useVerifyAccount();
    const [ otpExpires, setOtpExpires ] = useState<Date | null>(null);
    const [ countdown, setCountdown ] = useState<number>(0);
    const { username, email, profile, userId, token } = useSelector((state: RootState) => state.user);


    useEffect(() => {
        // Send OTP when the screen is first opened
        const sendInitialOTP = async () => {
            try {

                await sendOTP(email);
                Alert.alert('Success', 'OTP has been sent to your email');
                return;

            } catch (err: Error | any) {
                Alert.alert('Error', err);
            }
        };

        sendInitialOTP();

        const expirationTime = new Date();
        expirationTime.setSeconds(expirationTime.getSeconds() + 30);
        setOtpExpires(expirationTime);
    }, []);

    useEffect(() => {
        if (!otpExpires) return;

        const interval = setInterval(() => {
            const timeLeft = Math.max(0, Math.floor((otpExpires.getTime() - new Date().getTime()) / 1000));
            setCountdown(timeLeft);
            if (timeLeft === 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [ otpExpires ]);

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            Alert.alert('Error', 'OTP must be 6 digits');
            return;
        }

        try {
            await verifyAccount(otp);
            Alert.alert('Success', 'Account verified successfully');
            navigation.navigate('Tabs', { screen: 'Profile', params: { username } });
        } catch (err) {
            Alert.alert('Error', error || 'Verification failed');
        }
    };

    const reSendOTP = async () => {
        try {
            await sendOTP(email);
            Alert.alert('Success', 'OTP has been sent to your email');
            setCountdown(30);
        } catch (err: Error | any) {
            Alert.alert('Error', err);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView contentContainerStyle={styles.scrollView}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <View style={styles.headerContainer}>
                        <Text style={styles.headerText}>Xác thực OTP</Text>
                    </View>
                    <View style={styles.formContainer}>
                        <Text style={styles.instructionText}>Nhập 6 số được gửi đến email của bạn</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            maxLength={6}
                            value={otp}
                            onChangeText={setOtp}
                        />
                        <Text style={styles.countdownText}>
                            {countdown > 0
                                ? `OTP hết hạn trong: ${Math.floor(countdown / 60)}:${countdown % 60 < 10 ? `0${countdown % 60}` : countdown % 60}`
                                :
                                <Text onPress={reSendOTP}>Gửi lại OTP</Text>
                            }

                        </Text>
                        <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyOtp} disabled={loading}>
                            <Text style={styles.verifyButtonText}>{loading ? 'Đang xác thực...' : 'Xác thực'}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7FAFA',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollView: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 1,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    formContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    instructionText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
        textAlign: 'center',
    },
    input: {
        height: 48,
        borderColor: '#DDD',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        marginBottom: 16,
        textAlign: 'center',
    },
    countdownText: {
        fontSize: 14,
        color: 'red',
        textAlign: 'center',
        marginBottom: 16,
    },
    verifyButton: {
        backgroundColor: '#20B2AA',
        borderRadius: 8,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    verifyButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});