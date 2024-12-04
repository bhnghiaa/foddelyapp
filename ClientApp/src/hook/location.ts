// api.ts
import axios from 'axios';
import debounce from 'lodash.debounce';
import { calculateDistance, calculateTravelTime} from '../utils/locationUtils';
import { Coordinates } from '../@types';

const API_KEY = '""';

export interface Suggestion {
    place_id: string;
    lat: string;
    lon: string;
    display_name: string;
}

export const fetchCoordinates = async (address: string, myLocationMarker: Coordinates) => {
    try {
        const response = await axios.get('https://us1.locationiq.com/v1/search.php', {
            params: {
                key: API_KEY,
                q: address,
                countrycodes: 'VN', // Chỉ lấy địa điểm trong khu vực Việt Nam
                format: 'json',
                limit: 1,
            },
        });

        if (response.data && response.data[0]) {
            const { lat, lon } = response.data[0];
            const newAddressMarker = {
                latitude: parseFloat(lat),
                longitude: parseFloat(lon),
            };

            const distance = calculateDistance(myLocationMarker, newAddressMarker);
            const travelTime = Math.ceil(calculateTravelTime(distance));

            return { newAddressMarker, distance, travelTime };
        }
    } catch (error) {
    }
    return null;
};

export const fetchRoute = async (start: Coordinates, end: Coordinates) => {
    try {
        const response = await axios.get(
            `https://us1.locationiq.com/v1/directions/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}`,
            {
                params: {
                    key: API_KEY,
                    overview: 'full',
                    geometries: 'geojson',
                },
            }
        );

        if (response.data && response.data.routes[0]) {
            const coordinates = response.data.routes[0].geometry.coordinates.map(([lon, lat]: [number, number]) => ({
                latitude: lat,
                longitude: lon,
            }));
            return coordinates;
        }
    } catch (error) {
    }
    return [];
};

export const handleSearch = debounce(async (query: string, setSuggestions: (suggestions: Suggestion[]) => void) => {
    if (!query) return;
    try {
        const response = await axios.get('https://us1.locationiq.com/v1/autocomplete.php', {
            params: {
                key: API_KEY,
                q: query,
                countrycodes: 'VN', // Tìm kiếm trong Việt Nam
                format: 'json',
            },
        });

        if (response.data) {
            setSuggestions(response.data);
        }
    } catch (error) {
    }
}, 1000);

export const fetchAddressCoordinates = async (address: string, myLocationMarker: Coordinates, setAddressMarker: (marker: Coordinates) => void, setDistance: (distance: number) => void, setTravelTime: (time: number) => void, setRegion: (region: any) => void, setRouteCoordinates: (coordinates: Coordinates[]) => void) => {
    const result = await fetchCoordinates(address, myLocationMarker);
    if (result) {
        const { newAddressMarker, distance, travelTime } = result;
        setAddressMarker(newAddressMarker);
        setDistance(distance);
        setTravelTime(travelTime);

        setRegion({
            latitude: newAddressMarker.latitude,
            longitude: newAddressMarker.longitude,
            latitudeDelta: 0.0122,
            longitudeDelta: 0.0121,
        });

        // Fetch route from my location to address marker
        const route = await fetchRoute(myLocationMarker, newAddressMarker);
        setRouteCoordinates(route);
    }
};