import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';

console.log('Index.js: Starting app registration');

const AppWrapper = () => {
  console.log('AppWrapper: Rendering App component');
  return <App />;
};

AppRegistry.registerComponent('main', () => AppWrapper);

console.log('Index.js: App registration completed');