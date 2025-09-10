import React, { useState, useContext } from "react";
import { 
    View, 
    Text, 
    TextInput, 
    StyleSheet, 
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import config from '../config';
import { supabase } from "../supabase";
import Button from '../components/Button';

export default function Login({navigation}) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [linkPressed, setLinkPressed] = useState(false);
    const { setUserToken } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async () => {
        setLoading(true);
        console.log("Login Button Pressed");
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) {
                console.error('Login error: ', error.message);
                setErrorMessage(error);
                return;
            }

            await AsyncStorage.setItem('isLoggedIn', 'true');
            setUserToken(true);
            // setErrorMessage('Login Successful');
            console.log('Login success: ', data);
            setLoading(false);
            navigation.getParent().replace('Main');

            if (!data?.user) {
                setErrorMessage('User not found');
                console.error('No user returned from login');
                return;
            }
        } catch (error) {
            console.error('Error during login:', error);
            setError("Network error, please try again later");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.logo}>♡ Health-Routes</Text>
            <Text style={styles.header}>Login</Text>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <TextInput
                style={styles.input}
                placeholder="Enter your email"
                onChangeText={newEmail => setEmail(newEmail)}
                defaultValue={email}
            />
            <TextInput
                style={styles.input}
                placeholder="Enter your password"
                onChangeText={newPassword => setPassword(newPassword)}
                defaultValue={password}
                secureTextEntry={true}
            />

            <Button
                title="Login"
                variant="primary"
                size="large"
                onPress={handleLogin}
                loading={loading}
                style={styles.button}
            />

            <TouchableOpacity
                onPressIn={() => setLinkPressed(true)}
                onPressOut={() => setLinkPressed(false)}
                onPress={() => navigation.navigate('CreateUser')}
            >
                <Text style={[styles.navLink, linkPressed && styles.navLinkHover]}>
                    Don't have an account? Sign up
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        paddingTop: 60,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    logo: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 40,
        textAlign: 'center',
    },
    input: {
        height: 40,
        width: '100%',
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    header: {
        textAlign: 'center',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 32,
    },
    button: {
        width: '100%',
        marginBottom: 20,
    },
    navLink: {
        color: 'grey',
        marginTop: 10,
        fontSize: 16,
    },
    navLinkHover: {
        color: 'black',
    },
    errorText: {
        color: 'red',
        marginBottom: 15,
        textAlign: 'center',
    }
});
