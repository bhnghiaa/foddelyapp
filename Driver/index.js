/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
// Vô hiệu hóa tất cả các cảnh báo hiển thị trên màn hình
LogBox.ignoreAllLogs();

// Ghi đè console.warn và console.error để chúng không hiển thị
console.warn = () => { };
console.error = () => { };
AppRegistry.registerComponent(appName, () => App);
