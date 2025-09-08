import React from "react";
import { 
    View, 
    Text, 
    StyleSheet,
    TouchableOpacity
} from 'react-native';

export default function OnboardingScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Welcome to Health Routes</Text>

            {/* Login Button */}
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Login')}
            >
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            {/* Create Account Button */}
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('CreateUser')}
            >
                <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    header: {
        textAlign: 'center',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 40,
        color: '#000000',
    },
    button: {
        backgroundColor: '#000000',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        width: '80%',
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});