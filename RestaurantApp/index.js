/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
});

LogBox.ignoreAllLogs();

// Ghi đè console.warn và console.error để chúng không hiển thị
console.warn = () => { };
console.error = () => { };
AppRegistry.registerComponent(appName, () => App);
