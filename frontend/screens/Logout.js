import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from '@react-navigation/native';
import { supabase } from "../supabase";

export const Logout = async (setUserToken) => {
    
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("Supabase logout error:", error.message);
            return;
        }
        // Clear stored auth data
        await AsyncStorage.multiRemove(['isLoggedIn', 'userData', 'authToken']);

        console.log("Clearing Session Info");
        setUserToken(null);
        if (setUserToken === null) {
            console.log("Logout was successful");
        }

    } catch (error) {
        console.error('Error signing out:', error);
    }
};
