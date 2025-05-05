import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from '@react-navigation/native';

export const Logout = async (setUserToken) => {
    try {
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
