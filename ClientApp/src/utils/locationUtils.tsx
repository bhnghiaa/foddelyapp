import axios from 'axios';
import { PermissionsAndroid, Platform } from 'react-native';
import GetLocation from 'react-native-get-location';
import { API_LOCATION } from '../constants/api';
import { Coordinates } from '../@types';

const API_KEY = API_LOCATION;
interface OptimizedRouteResult {
  route: Coordinates[];
  distance: number;
}
export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Quyền truy cập vị trí',
        message: 'Ứng dụng cần truy cập vào vị trí của bạn.',
        buttonNeutral: 'Hỏi lại sau',
        buttonNegative: 'Hủy',
        buttonPositive: 'Đồng ý',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
};

export const getCurrentLocation = () => {
  return GetLocation.getCurrentPosition({
    enableHighAccuracy: true,
    timeout: 15000,
  });
};

export const reverseGeocode = async (latitude: number, longitude: number) => {
  const url = `https://us1.locationiq.com/v1/reverse.php?key=${API_KEY}&lat=${latitude}&lon=${longitude}&format=json`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};
const toRadians = (degrees: number): number => degrees * Math.PI / 180;
const isValidCoordinate = (coord: Coordinates): boolean => {
  return coord &&
    typeof coord.latitude === 'number' &&
    typeof coord.longitude === 'number' &&
    coord.latitude >= -90 && coord.latitude <= 90 &&
    coord.longitude >= -180 && coord.longitude <= 180;
};
export const calculateDistance = (start: Coordinates, end: Coordinates): number => {

  if (!isValidCoordinate(start) || !isValidCoordinate(end)) {
    throw new Error('Invalid coordinates provided');
  }

  const EARTH_SEMI_MAJOR_AXIS = 6378137; // bán trục lớn
  const FLATTENING = 1 / 298.257223563; // độ dẹt 
  const EARTH_SEMI_MINOR_AXIS = (1 - FLATTENING) * EARTH_SEMI_MAJOR_AXIS; //6,356,752 
  const CONVERGENCE_THRESHOLD = 1e-12; // ngưỡng hội tụ 
  const MAX_ITERATIONS = 100;


  const φ1 = toRadians(start.latitude);
  const φ2 = toRadians(end.latitude);
  const L = toRadians(end.longitude - start.longitude);

  const U1 = Math.atan((1 - FLATTENING) * Math.tan(φ1));
  const U2 = Math.atan((1 - FLATTENING) * Math.tan(φ2));
  const sinU1 = Math.sin(U1), cosU1 = Math.cos(U1);
  const sinU2 = Math.sin(U2), cosU2 = Math.cos(U2);

  let λ = L;
  let λʹ, sinσ, cosσ, σ, sinα, cos2α, cos2σm, C;

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    λʹ = λ;
    sinσ = Math.sqrt(
      Math.pow(cosU2 * Math.sin(λ), 2) +
      Math.pow(cosU1 * sinU2 - sinU1 * cosU2 * Math.cos(λ), 2)
    );

    if (sinσ === 0) return 0; // điểm trùng nhau

    cosσ = sinU1 * sinU2 + cosU1 * cosU2 * Math.cos(λ);
    σ = Math.atan2(sinσ, cosσ);
    sinα = cosU1 * cosU2 * Math.sin(λ) / sinσ;
    cos2α = Math.max(0, 1 - sinα * sinα);
    cos2σm = cosσ - 2 * sinU1 * sinU2 / cos2α;

    C = FLATTENING / 16 * cos2α * (4 + FLATTENING * (4 - 3 * cos2α));
    λ = L + (1 - C) * FLATTENING * sinα * (
      σ + C * sinσ * (cos2σm + C * cosσ * (-1 + 2 * Math.pow(cos2σm, 2)))
    );

    if (Math.abs(λ - λʹ) <= CONVERGENCE_THRESHOLD) {

      const u2 = cos2α * (Math.pow(EARTH_SEMI_MAJOR_AXIS, 2) - Math.pow(EARTH_SEMI_MINOR_AXIS, 2)) / Math.pow(EARTH_SEMI_MINOR_AXIS, 2);
      const A = 1 + u2 / 16384 * (4096 + u2 * (-768 + u2 * (320 - 175 * u2)));
      const B = u2 / 1024 * (256 + u2 * (-128 + u2 * (74 - 47 * u2)));
      const Δσ = B * sinσ * (
        cos2σm + B / 4 * (
          cosσ * (-1 + 2 * Math.pow(cos2σm, 2)) -
          B / 6 * cos2σm * (-3 + 4 * Math.pow(sinσ, 2)) * (-3 + 4 * Math.pow(cos2σm, 2))
        )
      );

      return EARTH_SEMI_MINOR_AXIS * A * (σ - Δσ) / 1000;
    }
  }

  throw new Error('Distance calculation failed to converge');
};

export const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} phút`;
  return `${hours} giờ ${mins} phút`;
};

const AVERAGE_SPEED_KMH = 25;
export const calculateTravelTime = (distance: number) => {
  return Math.ceil((distance / AVERAGE_SPEED_KMH) * 60);
};


const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getRoutes(start: Coordinates, end: Coordinates, retries = 3): Promise<Coordinates[][]> {
  try {
    const response = await axios.get(
      `https://us1.locationiq.com/v1/directions/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}`,
      {
        params: {
          key: API_KEY,
          overview: 'full',
          geometries: 'geojson',
          alternatives: true, // Lấy nhiều tuyến đường thay vì 1
        },
      }
    );
    return response.data.routes.map((route: any) =>
      route.geometry.coordinates.map((coord: any) => ({
        latitude: coord[ 1 ],
        longitude: coord[ 0 ],
      }))
    );
  } catch (error: any) {
    if (error.response?.status === 429 && retries > 0) {
      const waitTime = Math.pow(2, 4 - retries) * 1000; // Thời gian chờ tăng dần theo cấp số nhân
      await delay(waitTime); // Đợi thêm thời gian
      return getRoutes(start, end, retries - 1); // Retry
    }
    console.error('Error fetching routes:', error);
    return [];
  }
}

export const findOptimalRoute = (
  routes: Coordinates[][],
): OptimizedRouteResult => {
  let bestRoute: Coordinates[] = [];
  let minDistance = Infinity;

  if (!routes.length) {
    return { route: [], distance: 0 };
  }

  for (const route of routes) {
    const distance = route.reduce((acc, curr, index) => {
      if (index === 0) return acc;
      return acc + calculateDistance(route[ index - 1 ], curr);
    }, 0);

    if (distance < minDistance) {
      bestRoute = route;
      minDistance = distance;
    }
  }

  return {
    route: bestRoute,
    distance: minDistance
  };
};


export const formatAddress = (address: string) => {
  const addressText = address.replace(/, Vietnam$/, '');
  const addressArr = addressText.split(', ');
  addressArr.pop();
  const newAddressText = addressArr.join(', ');
  return newAddressText;
};