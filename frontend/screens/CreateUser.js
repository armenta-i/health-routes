import React, {useState} from "react";
import { 
    View, 
    Text, 
    TextInput,
    StyleSheet,
    TouchableOpacity
} from 'react-native';

export default function CreateUser({navigation}) {
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');

    const [linkPressed, setLinkPressed] = useState(false);

    const handleCreateUser = async () => {
        console.log("Button Pressed");

        try {
            console.log(name, phoneNumber, password);
            const response = await fetch('http://127.0.0.1:8000/users', {
                method: 'POST',
                headers: {
                    'Content-type' : 'application/json',
                },
                body: JSON.stringify({
                    full_name: name, 
                    phone_number: phoneNumber,
                    password: password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Successful: ", data);
                navigation.getParent().replace('Main');
            } else {
                console.log("Error fetching data: ", data.detail);
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
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
                secureTextEntry={true}
            />

            <TouchableOpacity
                onPress={handleCreateUser}
                style={styles.button}
            >
                <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPressIn={() => setLinkPressed(true)}
                onPressOut={() => setLinkPressed(false)}
                onPress={() => navigation.navigate('Login')}
            >
                <Text style={[styles.navLink, linkPressed && styles.navLinkHover]}>
                    Already have an account? Login
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
});
