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

export default function OnboardingScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Welcome</Text>

            {/* First Button */}
            <TouchableOpacity
                onPress={() => navigation.navigate('Login')
                }
            >
                <Text style={styles.navButton}>Login</Text>
            </TouchableOpacity>

            {/* Second Button */}
            <TouchableOpacity
                onPress={() => navigation.navigate('CreateUser')}
            >
                <Text style={styles.navButton}>Create Account</Text>
            </TouchableOpacity>
        </View>
    )
};

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
