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

        <TouchableOpacity onPress={handleSignup} style={styles.button}>
            {loading ? (
            <ActivityIndicator size="small" color="#fff" />
            ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
            )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.navLink}>Already have an account? Login</Text>
        </TouchableOpacity>
        </View>
    );
    }

    const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: "center" },
    input: {
        height: 40,
        borderColor: "gray",
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    header: { textAlign: "center", fontSize: 24, fontWeight: "bold", marginBottom: 20 },
    button: {
        backgroundColor: "#000",
        paddingVertical: 12,
        borderRadius: 5,
        alignItems: "center",
        marginBottom: 20,
    },
    buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    navLink: { color: "grey", textAlign: "center" },
    errorText: { color: "red", textAlign: "center", marginBottom: 10 },
});
