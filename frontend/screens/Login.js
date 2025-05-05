import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

export default async function Login({ navigation }) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');

    const url = `http://localhost:8000/api/places/nearby?latitude=37.7749&longitude=-122.4194&radius=1000`;

    // Changed something related to the await/async fetch method
    const res = await fetch(url);
    console.log(data.results);

    const handleLogin = async () => {
        try {
            console.log("Button Pressed");
            const response = await fetch('http://127.0.0.1:8000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone_number: phoneNumber,
                    password: password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Successful: ", data);
                navigation.navigate('LandingPage');
            } else {
                console.log("Error fetching data: ", data.detail);
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
                onChangeText={setPhoneNumber}
                value={phoneNumber}
            />
            <TextInput
                style={styles.input}
                placeholder="Enter your password"
                onChangeText={setPassword}
                value={password}
                secureTextEntry
            />

            <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.navButton}>Login</Text>
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
