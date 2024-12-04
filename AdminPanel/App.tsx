import { FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AdminScreen from './src/screens/AdminScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import { Provider } from 'react-redux'; // Import Provider từ react-redux
import { store } from './src/redux/store'; // Import store từ cấu hình redux

interface Props { }
const Stack = createNativeStackNavigator();
const App: FC<Props> = (props) => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Admin" component={AdminScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;