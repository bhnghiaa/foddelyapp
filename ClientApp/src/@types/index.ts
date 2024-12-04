interface Category {
    _id: string;
    title: string;
    value: string;
    imageUrl: string;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
}
interface ChoicesListType {
    id: number,
    name: string,
    value: string
}
interface Coords {
    id: string;
    latitude: number;
    longitude: number;
    address: string;
    title: string;
    latitudeDelta: number;
    longitudeDelta: number;
}

interface RestaurantType {
    longitude: number;
    latitude: number;
    _id: string;
    title: string;
    time: string;
    imageUrl: string;
    owner: string;
    code: string;
    logoUrl: string;
    ratings: number;
    ratingCount: number;
    coords: Coords;
    animation: Animated.Value;
    fcmToken: string;
}
interface Additive {
    id: number;
    title: string;
    price: string;
}

interface FoodItems {
    additives: Additive[];

    _id: string;

    title: string;

    foodTags: string[];

    foodType: (string | null)[];

    code: string;

    isAvailable: boolean;

    restaurant: RestaurantType;

    rating: number;

    ratingCount: string;

    description: string;

    price: number;

    time: string;

    imageUrl: string;

}
interface Product {
    _id: string;
    title: string;
    restaurant: string;
    rating: number;
    ratingCount: string;
    imageUrl: string[];
}


interface OrderItem {
    foodId: FoodItems;
    quantity: number;
    price: number;
    additives?: Additive[];
    instructions?: string;
  }
  
  interface Order {
    [ x: string ]: any;
    orderItems: OrderItem[];
    orderTotal: number;
    deliveryFee: number;
    grandTotal: number;
    deliveryAddress: string;
    restaurantAddress: string;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
    restaurantId: RestaurantType;
    restaurantCoords: number[];
    recipientCoords: number[];
    driverId: User;
  }
interface User {
    verification: boolean;
    _id: string;
    username: string;
    email: string;
    uid: string;
    address: string[];
    userType: string;
    profile: string;
    updatedAt: string;
}
interface Cart {
    title: string;    
    userId:string,
    productId: FoodItems,
    additives: Additive[],
    totalPrice: number,
    quantity: number,
    note:string,
    _id: string,
}
interface Rating {
    [ x: string ]: any;
    userId: User;
    itemType: string;
    itemId: RestaurantType | FoodItems | User;
    rating: number;
    review: string;
    photos: string[];
}
import { ParamListBase } from '@react-navigation/native';
import { Animated } from 'react-native';

type RootStackParamList = ParamListBase & {
    Login: undefined;
    SignUp: undefined;
    VerifyPhone: undefined;
    Tabs: { screen: string; params: { username?: string } };
    VerifyAccount: { userToken?: string };
    Restaurant: { restaurant: RestaurantType; distance: number; travelTime: number };
    Food: { food: FoodItems };
    RateRestaurant: { restaurant: RestaurantType };
    Location: { address: string, driverId: string };
    Cart: undefined;
    Checkout: { cartItems: Cart[]; totalAmount: number };
    Review: { restaurant: RestaurantType };
}
interface Coordinates {
    latitude: number;
    longitude: number;
}
interface Location {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}
export type {Coordinates, Location, Category, Rating, ChoicesListType, RestaurantType, FoodItems, OrderItem, Order, User, Additive, RootStackParamList,Cart };