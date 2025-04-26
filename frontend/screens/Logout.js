import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from '@react-navigation/native';

export const Logout = async (navigation, setUserToken) => {
    try {
        // Clear stored auth data
        await AsyncStorage.multiRemove(['isLoggedIn', 'userData', 'authToken']);

        const resetAction = CommonActions.reset({
            index: 0,
            routes: [{ name: 'Auth' }], // 👈 Go back to Auth stack (your Login/Register screens)
        });

        navigation.dispatch(resetAction);
        console.log("Logout was successful");

    } catch (error) {
        console.error('Error signing out:', error);
    }
};
