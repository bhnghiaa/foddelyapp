import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { Provider } from 'react-redux'; // Import Provider từ react-redux
import { store } from './src/redux/store'; // Import store từ cấu hình redux
import HomeScreen from './src/screen/HomeScreen';
import SearchScreen from './src/screen/SearchScreen';
import OrdersScreen from './src/screen/OrdersScreen';
import Profile from './src/screen/Profile';
import LoginScreen from './src/screen/LoginScreen';
import SignUpScreen from './src/screen/SignUpScreen';
import VerifyPhone from './src/screen/VerifyPhone';
import VerifyAccountScreen from './src/screen/VerifyAccountScreen';
import RestaurantScreen from './src/screen/RestaurantScreen';
import FoodScreen from './src/screen/FoodScreen';
import RateRestaurantScreen from './src/screen/RateRestaurantScreen';
import LocationScreen from './src/screen/LocationScreen';
import CartScreen from './src/screen/CartScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CheckoutScreen from './src/screen/CheckoutScreen';
import { StripeProvider } from '@stripe/stripe-react-native';
import ReviewScreen from './src/screen/ReviewScreen';
import VerifyScreen from './src/screen/VerifyScreen';
import PaymentHistoryScreen from './src/screen/PaymentHistoryScreen';

// Tạo các navigator
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const queryClient = new QueryClient();

// Tab Navigator
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        switch (route.name) {
          case 'Home':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Search':
            iconName = focused ? 'search' : 'search-outline';
            break;
          case 'Orders':
            iconName = focused ? 'cart-sharp' : 'cart-outline';
            break;
          case 'Profile':
            iconName = focused ? 'person' : 'person-outline';
            break;
          default:
            iconName = 'home'; // Giá trị mặc định
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#20B2AA',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: { backgroundColor: '#fff', paddingBottom: 5 },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false, tabBarLabel: 'Trang chủ' }} />
    <Tab.Screen name="Search" component={SearchScreen} options={{ headerShown: false, tabBarLabel: 'Tìm kiếm' }} />
    <Tab.Screen name="Orders" component={OrdersScreen} options={{ headerShown: false, tabBarLabel: 'Đơn hàng' }} />
    <Tab.Screen name="Profile" component={Profile} options={{ headerShown: false, tabBarLabel: 'Tôi' }} />
  </Tab.Navigator>
);

// Stack Navigator
const AppNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
    <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
    <Stack.Screen name="VerifyPhone" component={VerifyPhone} options={{ headerShown: false }} />
    <Stack.Screen name="VerifyAccount" component={VerifyAccountScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Restaurant" component={RestaurantScreen} options={{ headerShown: false, }} />
    <Stack.Screen name="Food" component={FoodScreen} options={{ headerShown: false }} />
    <Stack.Screen name="RateRestaurant" component={RateRestaurantScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Location" component={LocationScreen} options={{ headerTitle: 'Địa chỉ' }} />
    <Stack.Screen name="Cart" component={CartScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Review" component={ReviewScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Verify" component={VerifyScreen} options={{ headerShown: false }} />
    <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51QISZgKuXrVNElsLTH3kqMMFVt8kRQChLQ6tFXfsO9MHQ4SW3lM46ASjYLMXwkK60tVZk9pViDxs91liFFh2FHx900l9ypgX6c';

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </StripeProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
