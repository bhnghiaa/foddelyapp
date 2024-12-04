// getCurrentLocation.ts
import { Platform, PermissionsAndroid } from "react-native";
import GetLocation from "react-native-get-location";
import { Location } from "../@types";

export const getCurrentLocation = async (): Promise<Location | null> => {
    if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: 'Location Permission',
                message: 'This app needs access to your location.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            return null;
        }
    }

    try {
        const location = await GetLocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 15000,
        });

        return {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        };
    } catch (error: Error | any) {
        return null;
    }
};