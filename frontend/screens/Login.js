import React, {useState} from "react";
import {View,Text,TextInput,Button,StyleSheet,TouchableOpacity} from 'react-native';
import { FieldError } from 'react';
import { NavigationContainer } from "@react-navigation/native";

export default async function Login({ navigation }) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');

    const url = `http://localhost:8000/api/places/nearby?latitude=37.7749&longitude=-122.4194&radius=1000`;

    // Changed something related to the await/async fetch method
    const res = await fetch(url);
    console.log(data.results);

    const handleLogin = async () => {
        console.log("Button Pressed")
        navigation.navigate('LandingPage');
        try {
            const response = await fetch('http://localhost:8000/login', {
                method: 'POST',
                headers: {
                    'Content-type' : 'application/json',
                },
                body: JSON.stringify({
                    phone_number: phoneNumber,
                    password: password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Successful: ", data)
            } else {
                console.log("Error fetching data", data.detail);
            }
        } catch (error) {
            console.error('Error during login:', error);
            setError("Network error, please try again later");
        }
    }
    
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
            />

            <TouchableOpacity
                onPress={() => navigation.navigate('LandingPage')}
            >
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
    },
    header: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    navButton: {
        backgroundColor: 'white',
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 8,
    }
});
