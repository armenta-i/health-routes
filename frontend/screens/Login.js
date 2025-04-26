import React, {useState} from "react";
import { 
    View, 
    Text, 
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert
} from 'react-native';

export default function Login({navigation}) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        console.log("Login Button Pressed");
        setError(''); // Clear previous errors
        
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
                // Navigate to main screen or dashboard
                Alert.alert("Success", "Login successful!");
                navigation.getParent().replace('Main');
            } else {
                console.log("Login Error:", data.detail);
                setError(data.detail || "Login failed");
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
                secureTextEntry={true}
            />

            <TouchableOpacity
                onPress={handleLogin}
                style={styles.button}
            >
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => navigation.navigate('CreateUser')}
            >
                <Text style={styles.navLink}>Don't have an account? Sign up</Text>
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
        backgroundColor: '#4a90e2',
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
        color: '#4a90e2',
        marginTop: 10,
    },
    errorText: {
        color: 'red',
        marginBottom: 15,
        textAlign: 'center',
    }
});