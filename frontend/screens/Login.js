import React, { useState, useContext } from "react";
import { 
    View, 
    Text, 
    TextInput, 
    StyleSheet, 
    TouchableOpacity 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../navigation/AppNavigator'; // Adjust if needed

export default function Login({navigation}) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        console.log("Login Button Pressed");
        try {
            const response = await fetch('http://127.0.0.1:8000/login', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify({
                    phone_number: phoneNumber,
                    password: password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Login Successful:", data);
                await AsyncStorage.setItem('isLoggedIn', 'true');
                setUserToken(true);
                console.log("Login was successful");
            } else {
                console.log("Login Error:", data.detail);
                setError(data.detail || "Login failed");
            }
        } catch (error) {
            console.error('Error during login:', error);
            setError("Network error, please try again later");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Login</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                onChangeText={newPhone => setPhoneNumber(newPhone)}
                defaultValue={phoneNumber}
            />
            <TextInput
                style={styles.input}
                placeholder="Enter your password"
                onChangeText={newPassword => setPassword(newPassword)}
                defaultValue={password}
                secureTextEntry={true}
            />

            <TouchableOpacity
                onPress={handleLogin}
                style={styles.button}
            >
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

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
        padding: 20,
        paddingTop: 10,
        justifyContent: 'center',
        alignItems: 'center',
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
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#000000',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
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
