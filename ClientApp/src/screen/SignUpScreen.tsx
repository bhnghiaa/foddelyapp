import LottieView from 'lottie-react-native';
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
import { useNavigation, NavigationProp } from '@react-navigation/native';
import axios from 'axios';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { RootStackParamList } from '../@types';
import { API } from '../constants/api';
import LinearGradient from 'react-native-linear-gradient';

const validationSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    email: Yup.string()
        .email('Invalid email format')
        .required('Email is required'),
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
});

export default function SignUpScreen() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const animation = useRef(null);
    const [ showPassword, setShowPassword ] = useState(false);
    const [ loading, setLoading ] = useState(false);
    const handleSignUp = async (values: { username: string; email: string; password: string; }) => {
        const { username, email, password } = values;
        setLoading(true);

        try {
            const response = await axios.post(`${API}/api/auth/register/Client`, {
                username,
                email,
                password,
            });

            Alert.alert('Success', response.data.message);
            navigation.navigate('Login');
        } catch (error) {
            if ((error as any).response) {
                const errorMessage = (error as any).response.data.message;
                Alert.alert('Error', errorMessage);
            } else {
                Alert.alert('Error', 'Signup failed. Please try again later.');
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
                        <Text style={styles.welcomeText}>Tạo tài khoản mới</Text>
                        <Text style={styles.subtitleText}>Đăng ký để trải nghiệm dịch vụ</Text>
                    </View>

                    <View style={styles.illustrationContainer}>
                        <LottieView
                            autoPlay
                            ref={animation}
                            style={styles.illustration}
                            source={require("../assets/delyfood.json")}
                        />
                    </View>

                    <View style={styles.formContainer}>
                        <Formik
                            initialValues={{ username: '', email: '', password: '' }}
                            validationSchema={validationSchema}
                            onSubmit={handleSignUp}
                        >
                            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                                <>
                                    <View style={styles.inputContainer}>
                                        <Icon name="person-outline" size={22} color="#20B2AA" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Tên người dùng"
                                            placeholderTextColor="#999"
                                            onChangeText={handleChange('username')}
                                            onBlur={handleBlur('username')}
                                            value={values.username}
                                        />
                                    </View>
                                    {errors.username && touched.username && (
                                        <Text style={styles.errorText}>{errors.username}</Text>
                                    )}

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

                                    <View style={styles.inputContainer}>
                                        <Icon name="lock-closed-outline" size={22} color="#20B2AA" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Mật khẩu"
                                            placeholderTextColor="#999"
                                            onChangeText={handleChange('password')}
                                            onBlur={handleBlur('password')}
                                            value={values.password}
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
                                        style={styles.signupButton}
                                        onPress={() => handleSubmit()}
                                        activeOpacity={0.8}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text style={styles.signupButtonText}>Đăng ký</Text>
                                        )}
                                    </TouchableOpacity>

                                    <View style={styles.divider}>
                                        <View style={styles.dividerLine} />
                                        <Text style={styles.dividerText}>HOẶC</Text>
                                        <View style={styles.dividerLine} />
                                    </View>

                                    <TouchableOpacity
                                        style={styles.loginButton}
                                        onPress={() => navigation.navigate('Login')}
                                    >
                                        <Text style={styles.loginButtonText}>
                                            Đã có tài khoản? Đăng nhập
                                        </Text>
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
    container: {
        flex: 1,
    },
    keyboardAvoidingView: {
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
    signupButton: {
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
    signupButtonText: {
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
    loginButton: {
        borderWidth: 1,
        borderColor: '#20B2AA',
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    loginButtonText: {
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
    scrollView: {
        flexGrow: 1,
    },
});