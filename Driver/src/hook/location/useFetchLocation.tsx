import { useEffect, useState } from 'react';
import { getCurrentLocation, requestLocationPermission, reverseGeocode } from '../../utils/locationUtils';
import { Coordinates } from '../../@types';
import { formatAddress } from '../../utils/locationUtils';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import axios from 'axios';
import { API } from '../../constants/api';
export const useUserLocation = () => {
    const [ userCoords, setUserCoords ] = useState<Coordinates | null>(null);
    const [ error, setError ] = useState<string | null>(null);
    const [ loading, setLoading ] = useState(false);
    const { userId, token } = useSelector((state: RootState) => state.user);

    const fetchLocation = async () => {
        setLoading(true);
        try {
            const hasPermission = await requestLocationPermission();
            if (!hasPermission) {
                setError('Location permission denied');
                return null;
            }

            const locationData = await getCurrentLocation();
            const coords = {
                latitude: locationData.latitude,
                longitude: locationData.longitude
            };
            setUserCoords(coords);
            setError(null);
            return coords;
        } catch (err) {
            setError('Failed to get location');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const updateLocation = async (coords: Coordinates) => {
        setLoading(true);
        try {
            const response = await axios.post(`${API}/api/location`,
                {
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                }
                , {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                });
            setLoading(false);
            if (response.status === 200) {
            }
        } catch (error) {

        }
    }

    useEffect(() => {
        fetchLocation();
    }, []);

    const refetch = async () => {
        await fetchLocation();
    }

    return { userCoords, error, loading, fetchLocation, refetch, updateLocation };
};

export const useAddress = () => {
    const [ address, setAddress ] = useState<string | null>(null);
    const [ error, setError ] = useState<string | null>(null);
    const [ loading, setLoading ] = useState(false);

    const fetchAddress = async (coords: Coordinates) => {
        setLoading(true);
        try {
            const addressData = await reverseGeocode(
                coords.latitude,
                coords.longitude
            );

            // addressData.display_name = "Opera House, 1A, Trang Tien Street, Phường Phan Chu Trinh, Hoan Kiem District, Hà Nội, 11021, Vietnam"
            // const addressText = addressData.display_name.replace(/, Vietnam$/, '');
            // const addressArr = addressText.split(', ');
            // addressArr.pop();
            // const newAddressText = addressArr.join(', ');
            // const newAddressText = formatAddress(addressData.display_name);
            const newAddressText = formatAddress(addressData.display_name);
            setAddress(newAddressText);
            setError(null);
            return newAddressText;
        } catch (err) {
            setError('Failed to get address');
            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

    }, []);

    return {
        address,
        error,
        loading,
        fetchAddress,
        refetch: (coords: Coordinates) => fetchAddress(coords)
    };
};