import React from "react";
import { 
    View, 
    Text, 
    StyleSheet,
    TouchableOpacity,
    Image
} from 'react-native';
import Button from '../components/Button';

export default function OnboardingScreen({ navigation }) {
    return (
        <View style={styles.container}>
            {/* <Text style={styles.logo}>♡ Health-Routes</Text> */}
            <Image 
                source={require('../assets/logo_health_routes.png')} 
                style={styles.logo} 
                resizeMode="contain"
            />
            <Text style={styles.header}>Welcome to Health Routes</Text>

            {/* Login Button */}
            <Button
                title="Login"
                variant="primary"
                size="large"
                onPress={() => navigation.navigate('Login')}
                style={styles.button}
            />

            {/* Create Account Button */}
            <Button
                title="Create Account"
                variant="primary"
                size="large"
                onPress={() => navigation.navigate('CreateUser')}
                style={styles.button}
            />
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
        backgroundColor: '#f5f5f5',
    },
    logo: {
        fontSize: 28,
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
    },
    header: {
        textAlign: 'center',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 48,
        color: '#000000',
    },
    button: {
        width: '80%',
        marginBottom: 20,
    },
});