import React, { useState } from 'react';
import { TextInput, Button, View, Text, StyleSheet, Image } from 'react-native';
import { auth } from '../context/firebase'; 
import { signInWithEmailAndPassword } from 'firebase/auth'; 
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient

const LoginScreen = ({ navigation }) => {
console.log("Login");
console.warn("Avertissement : Login Screen chargé");
console.error("Erreur : Login Screen chargé");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('Home'); 
    } catch (e) {
      setError('Erreur d\'authentification. Vérifie tes identifiants.');
    }
  };

  return (
    <LinearGradient 
      colors={["#333", "#000"]}  // You can customize the gradient colors
      style={styles.container}
    >
      {/* <Image 
        source={require('../assets/logo.png')}  // Replace with your logo's path
        style={styles.logo}
      /> */}
      
      <Text style={styles.title}>My crypto</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#999"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#999"
      />
      
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <Button title="Se connecter" onPress={handleLogin} color="#ffb700" />
      
      {/* <Text style={styles.footerText}>© 2025 crypto App</Text> */}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 150, // Adjust based on your logo size
    height: 150, // Adjust based on your logo size
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    color: '#ffb700',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 45,
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    paddingLeft: 15,
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginBottom: 20,
  },
  footerText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 20,
  },
});

export default LoginScreen;
