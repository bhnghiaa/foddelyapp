import { FC, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import { Provider, useSelector } from 'react-redux';
import { RootState, store } from './src/redux/store';
import FoodScreen from './src/screens/FoodScreen';
import FoodList from './src/screens/FoodList';
import UpLoadFoodScreen from './src/screens/UpLoadFoodScreen';
import AddDetailsScreen from './src/screens/AddDetailsScreen';
import AddAdditivesScreen from './src/screens/AddAdditivesScreen';
import { FoodFormProvider } from './src/context/FoodFormContext';
import AddRestaurantScreen from './src/screens/AddRestaurantScreen';
import UpdateFoodItem from './src/screens/UpdateFoodItem';
import Profile from './src/screens/Profile';
import PendingScreen from './src/screens/PendingScreen';
import useFetchUser from './src/hook/useFetchUser';
import Verify from './src/screens/Verify';
import WalletScreen from './src/screens/WalletScreen';

const Stack = createStackNavigator();
interface Props { }
const App: FC<Props> = (props) => {
  return (
    <Provider store={store}>
      <FoodFormProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
          <Stack.Navigator>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
            <Stack.Screen name="AddRestaurant" component={AddRestaurantScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Food" component={FoodScreen} options={{ headerShown: false }} />
            <Stack.Screen name="FoodList" component={FoodList} options={{ headerShown: false }} />
            <Stack.Screen name="UpLoadFood" component={UpLoadFoodScreen} options={{ headerShown: false }} />
            <Stack.Screen name="AddDetails" component={AddDetailsScreen} options={{ title: 'Thêm món ăn' }} />
            <Stack.Screen name="AddAdditives" component={AddAdditivesScreen} options={{ title: 'Thêm phụ gia' }} />
            <Stack.Screen name="UpdateFoodItem" component={UpdateFoodItem} options={{ title: 'Chỉnh sửa' }} />
            <Stack.Screen name="Profile" component={Profile} options={{ title: 'Thông tin cá nhân' }} />
            <Stack.Screen name="Pending" component={PendingScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Verify" component={Verify} options={{ headerShown: false }} />
            <Stack.Screen name="Wallet" component={WalletScreen} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </FoodFormProvider>
    </Provider>

  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;