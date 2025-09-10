import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { supabase } from "../supabase";
import Button from '../components/Button';

export default function CreateUser({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSignup = async () => {
        setLoading(true);
        setErrorMessage("");

        const { data, error } = await supabase.auth.signUp({
        email,
        password,
        });

        if (error) {
        console.error("Signup error:", error.message);
        setErrorMessage(error.message);
        setLoading(false);
        return;
        }

        if (data.user) {
        console.log("Signup success:", data);
        navigation.replace("Login"); // go back to login after creating account
        }

        setLoading(false);
    };

    return (
        <View style={styles.container}>
        <Text style={styles.logo}>♡ Health-Routes</Text>
        <Text style={styles.header}>Create Account</Text>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <TextInput
            style={styles.input}
            placeholder="Enter your email"
            onChangeText={setEmail}
            value={email}
        />
        <TextInput
            style={styles.input}
            placeholder="Enter your password (min 6 chars)"
            onChangeText={setPassword}
            value={password}
            secureTextEntry
        />

        <Button
            title="Sign Up"
            variant="primary"
            size="large"
            onPress={handleSignup}
            loading={loading}
            style={styles.button}
        />

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.navLink}>Already have an account? Login</Text>
        </TouchableOpacity>
        </View>
    );
    }

    const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 24, 
        paddingTop: 60,
        justifyContent: "center",
        backgroundColor: '#fff'
    },
    logo: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 40,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: "gray",
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    header: { textAlign: "center", fontSize: 32, fontWeight: "bold", marginBottom: 32 },
    button: {
        marginBottom: 20,
    },
    navLink: { color: "grey", textAlign: "center" },
    errorText: { color: "red", textAlign: "center", marginBottom: 10 },
});
