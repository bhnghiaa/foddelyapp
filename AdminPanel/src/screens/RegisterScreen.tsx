import LottieView from 'lottie-react-native';
import React, { useRef } from 'react';
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
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, NavigationProp } from '@react-navigation/native';

import axios from 'axios';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { RootStackParamList } from '../@types';
import { API } from '../constants/api';
// Validation schema with Yup
const validationSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    email: Yup.string()
        .email('Invalid email format')
        .required('Email is required'),
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
});

export default function RegisterScreen() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const animation = useRef(null);


    const handleSignUp = async (values: { username: string; email: string; password: string; }) => {
        const { username, email, password } = values;

        try {
            const response = await axios.post(`${API}/api/auth/register/Admin`, {
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
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView contentContainerStyle={styles.scrollView}>
                    <View style={styles.illustrationContainer}>
                        <LottieView
                            autoPlay
                            ref={animation}
                            style={{ width: "100%", height: 300 }}
                            source={require("../assets/anime/delivery.json")}
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
                                        <Icon name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Username"
                                            onChangeText={handleChange('username')}
                                            onBlur={handleBlur('username')}
                                            value={values.username}
                                        />
                                    </View>
                                    {errors.username && touched.username && (
                                        <Text style={styles.errorText}>{errors.username}</Text>
                                    )}

                                    <View style={styles.inputContainer}>
                                        <Icon name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Email"
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
                                        <Icon name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Password"
                                            onChangeText={handleChange('password')}
                                            onBlur={handleBlur('password')}
                                            value={values.password}
                                            secureTextEntry
                                        />
                                    </View>
                                    {errors.password && touched.password && (
                                        <Text style={styles.errorText}>{errors.password}</Text>
                                    )}

                                    <TouchableOpacity style={styles.registerButton} onPress={() => handleSubmit()}>
                                        <Text style={styles.registerButtonText}>Sign Up</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                        <Text>Already have an account? Login</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </Formik>
                    </View>

                    <View style={styles.foodImagesContainer}>
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
    },
    illustrationContainer: {
        alignItems: 'center',
        marginVertical: 24,
    },
    formContainer: {
        paddingHorizontal: 24,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        marginBottom: 16,
        paddingHorizontal: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 48,
        fontSize: 16,
        color: '#333',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginBottom: 8,
    },
    registerButton: {
        backgroundColor: '#20B2AA',
        borderRadius: 8,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    foodImagesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 32,
        paddingHorizontal: 16,
    },
});
