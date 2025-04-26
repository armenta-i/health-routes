import React, {useState} from "react";
import { 
    View, 
    Text, 
    TextInput,
    Button,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import { FieldError } from 'react';
import { NavigationContainer } from "@react-navigation/native";

export default function CreateUser({navigation}) {
    const [name, setName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');

    const handleCreateUser = async () => {
        console.log("Button Pressed")
        navigation.navigate('Login');
        // try {
        //     const response = await fetch('', {
        //         method: 'POST',
        //         headers: {
        //             'Content-type' : 'application/json',
        //         },
        //         body: JSON.stringify({
        //             phone_number: phoneNumber,
        //             password: password,
        //         }),
        //     });

        //     const data = await response.json();

        //     if (response.ok) {
        //         console.log("Successful: ", data)
        //     } else {
        //         console.log("Error fetching data", data.detail);
        //     }
        // } catch (error) {
        //     console.error('Error during login:', error);
        // }
    }
    
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Create Account</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your name"
                onChangeText={newName => setName(newName)}
                defaultValue={name}
            />
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
                <Text style={styles.navButton}>Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
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
        marginBottom: 15
    },
});
