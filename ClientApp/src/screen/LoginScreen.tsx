import FastImage from 'react-native-fast-image';
import React, { useRef, useState } from 'react';
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
    Image,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, NavigationProp, StackActions } from '@react-navigation/native';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { RootStackParamList } from '../@types';
import LottieView from 'lottie-react-native';
import { API } from '../constants/api';
import LinearGradient from 'react-native-linear-gradient';

const validationSchema = Yup.object().shape({
    email: Yup.string()
        .email('Email không hợp lệ')
        .required('Email là bắt buộc'),
    password: Yup.string()
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
        .required('Mật khẩu là bắt buộc'),
});

export default function LoginScreen() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const dispatch = useDispatch();
    const [ loading, setLoading ] = useState(false);
    const [ showPassword, setShowPassword ] = useState(false);
    const animation = useRef(null);

    const handleLogin = async (values: { email: string; password: string }) => {
        const { email, password } = values;
        setLoading(true);
        try {
            const response = await axios.post(`${API}/api/auth/login/Client`, {
                email,
                password,
            });

            const { userToken, username, _id, profile } = response.data;

            dispatch(setUserData({
                username, token: userToken,
                profile: profile,
                email: email,
                userId: _id,
            }));
            setLoading(false);
            navigation.dispatch(
                StackActions.replace('Tabs', { screen: 'Profile', params: { username } })
            );
        } catch (error) {
            if ((error as any).response) {
                if (axios.isAxiosError(error) && error.response) {
                    Alert.alert('Lỗi', error.response.data.message);
                } else {
                    Alert.alert('Lỗi', 'Đăng nhập thất bại. Vui lòng thử lại sau.');
                }
            } else {
                Alert.alert('Lỗi', 'Đăng nhập thất bại. Vui lòng thử lại sau.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={[ '#F7FAFA', '#E0F7FA', '#B2EBF2' ]}
            style={styles.container}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.headerContainer}>
                    </View>

                    <View style={styles.illustrationContainer}>
                        {loading ? (
                            <FastImage
                                style={styles.illustration}
                                source={require('../assets/anime/shot.gif')}
                                resizeMode={FastImage.resizeMode.contain}
                            />
                        ) : (
                            <LottieView
                                autoPlay
                                ref={animation}
                                style={styles.illustration}
                                source={require("../assets/delyfood.json")}
                            />
                        )}
                    </View>

                    <View style={styles.formContainer}>
                        <Formik
                            initialValues={{ email: '', password: '' }}
                            validationSchema={validationSchema}
                            onSubmit={handleLogin}
                        >
                            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                                <>
                                    <View style={styles.inputContainer}>
                                        <Icon name="mail-outline" size={22} color="#20B2AA" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Email"
                                            placeholderTextColor="#999"
                                            onChangeText={handleChange('email')}
                                            onBlur={handleBlur('email')}
                                            value={values.email}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>

                                    {errors.email && touched.email && (
                                        <Text style={styles.errorText}>{errors.email}</Text>
                                    )}

                                    <View style={styles.inputContainer}>
                                        <Icon name="lock-closed-outline" size={22} color="#20B2AA" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Mật khẩu"
                                            placeholderTextColor="#999"
                                            onChangeText={handleChange('password')}
                                            onBlur={handleBlur('password')}
                                            value={values.password}
                                            autoCapitalize='none'
                                            secureTextEntry={!showPassword}
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            <Icon
                                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                                size={22}
                                                color="#666"
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.loginButton}
                                        onPress={() => handleSubmit()}
                                        activeOpacity={0.8}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text style={styles.loginButtonText}>Đăng nhập</Text>
                                        )}
                                    </TouchableOpacity>

                                    <View style={styles.divider}>
                                        <View style={styles.dividerLine} />
                                        <Text style={styles.dividerText}>HOẶC</Text>
                                        <View style={styles.dividerLine} />
                                    </View>

                                    <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate("SignUp")}>
                                        <Text style={styles.registerText}>Tạo tài khoản mới</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </Formik>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollView: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
    },
    headerContainer: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#20B2AA',
        marginBottom: 8,
    },
    subtitleText: {
        fontSize: 16,
        color: '#666',
    },
    illustrationContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    },
    illustration: {
        width: "100%",
        height: 300,
    },
    formContainer: {
        paddingHorizontal: 16,
        paddingVertical: 24,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 56,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 56,
        fontSize: 16,
        color: '#333',
    },
    loginButton: {
        backgroundColor: '#20B2AA',
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        shadowColor: '#20B2AA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#666',
        fontSize: 14,
    },
    registerButton: {
        borderWidth: 1,
        borderColor: '#20B2AA',
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    registerText: {
        color: '#20B2AA',
        fontSize: 16,
        fontWeight: '600',
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 12,
        marginTop: -8,
        marginBottom: 8,
        marginLeft: 4,
    },
});