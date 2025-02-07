import React, { useState, useEffect, useContext } from "react";
import { View, Text, Button, Image, Alert, ActivityIndicator, StyleSheet,TouchableOpacity } from "react-native";
import { AuthContext } from "../context/AuthContext";
import * as ImagePicker from "expo-image-picker"; 
import { useNavigation } from "@react-navigation/native";
import { IconButton } from "react-native-paper";
import { uploadImageToCloudinary, saveProfileImageUrl, getProfileImageUrl } from "../context/firebase";
import { LinearGradient } from "expo-linear-gradient";

const ProfileScreen = () => {
  const { user, signOut } = useContext(AuthContext); 
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const loadProfileImage = async () => {
      if (user?.uid) {
        const imageUrl = await getProfileImageUrl(user.uid);
        if (imageUrl) setPhoto(imageUrl);
      }
    };
    loadProfileImage();
  }, [user]);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission de caméra non accordée');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,  
      aspect: [4, 3],       
      quality: 1,           
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setPhoto(imageUri); 
      
      setLoading(true);
      const uploadedUrl = await uploadImageToCloudinary(imageUri);
      setLoading(false);

      if (uploadedUrl) {
        await saveProfileImageUrl(user.uid, uploadedUrl);
        setPhoto(uploadedUrl); 
      } else {
        alert("Erreur lors du téléchargement de l'image.");
      }
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      "Déconnexion",
      "Voulez-vous vraiment vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Se déconnecter",
          onPress: () => {
            signOut(); 
            navigation.replace('Login'); 
          }
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <LinearGradient colors={["#333", "#000"]}  style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <Text style={styles.text}>Nom: {user?.displayName}</Text>
      <Text style={styles.text}>Email: {user?.email}</Text>

      <View style={styles.imageContainer}>
        {loading ? (
          <ActivityIndicator size="large"  />
        ) : photo ? (
          <TouchableOpacity onPress={takePhoto}>
            <Image
              source={{ uri: photo }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        ) : (
          <IconButton
            icon="account-circle"
            size={100}
            style={styles.iconButton}
            onPress={takePhoto}
          />
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Prendre une photo" onPress={takePhoto}  />
        <Button title="Se déconnecter" onPress={handleSignOut}  />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    color: "#fff",
    textAlign: 'center',
  },
  text: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 10,
  },
  imageContainer: {
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "gray",
    shadowColor: "gray",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  iconButton: {
    backgroundColor: "#ddd",
    borderRadius: 50,
    elevation: 8,
  },
  buttonContainer: {
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
  },
});

export default ProfileScreen;
