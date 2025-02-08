import React, { useState, useEffect, useContext } from "react";
import { View, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { IconButton } from "react-native-paper";
import { AuthContext } from "../context/AuthContext";
import { getProfileImageUrl, getFavorite, getOperation } from "../context/firebase";
import CoursScreen from "./CoursScreen";
import TransactionScreen from "./TransactionScreen";
import PortefeuilleScreen from "./PortefeuilleScreen";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Tab = createBottomTabNavigator();

const HomeScreen = () => {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const [photo, setPhoto] = useState(null);
  const [favoriteCrypto, setFavoriteCrypto] = useState(null);
  const [operation, setOperation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (user?.uid) {
          // Chargement de l'image de profil
          try {
            const imageUrl = await getProfileImageUrl(user.uid);
            if (imageUrl) setPhoto(imageUrl);
          } catch (e) {
            console.error('Erreur lors du chargement de l\'image:', e);
            // Continue l'exécution même si l'image échoue
          }

          // Chargement des favoris
          try {
            const favorite = await getFavorite(user.uid);
            setFavoriteCrypto(favorite);
          } catch (e) {
            console.error('Erreur lors du chargement des favoris:', e);
            // Continue l'exécution même si les favoris échouent
          }
        }

        // Initialisation des notifications
        try {
          const lastNotified = await AsyncStorage.getItem("lastNotified");
          if (lastNotified === null) {
            await AsyncStorage.setItem("lastNotified", "");
          }
        } catch (e) {
          console.error('Erreur lors de l\'initialisation des notifications:', e);
          // Continue l'exécution même si les notifications échouent
        }

      } catch (e) {
        console.error('Erreur lors de l\'initialisation:', e);
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [user]);

  useEffect(() => {
    const unsubscribe = getOperation((operationData) => {
      try {
        console.log('Operation data fetched:', operationData);
        setOperation(operationData);
      } catch (e) {
        console.error('Erreur lors de la récupération des opérations:', e);
      }
    });

    // Cleanup function
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (operation && favoriteCrypto && operation.cryptoname === favoriteCrypto) {
      const checkAndNotify = async () => {
        try {
          const lastNotified = await AsyncStorage.getItem("lastNotified");
          console.log('Last notified ID:', lastNotified);

          if (lastNotified !== String(operation.idTransaction)) {
            await AsyncStorage.setItem("lastNotified", String(operation.idTransaction));

            await Notifications.scheduleNotificationAsync({
              content: {
                title: "Nouvelle opération",
                body: `${operation.nomEffectuant} a effectué un ${operation.name} sur votre cryptomonnaie favorite : ${operation.cryptoname}`,
                sound: true,
              },
              trigger: null,
            });
          }
        } catch (error) {
          console.error('Erreur lors de la gestion des notifications:', error);
        }
      };

      checkAndNotify();
    }
  }, [operation, favoriteCrypto]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Une erreur est survenue. Veuillez réessayer.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          position: "absolute",
          top: 40,
          right: 20,
          zIndex: 10,
        }}
      >
        {photo ? (
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <Image
              source={{ uri: photo }}
              style={{ width: 60, height: 60, borderRadius: 30 }}
            />
          </TouchableOpacity>
        ) : (
          <IconButton
            icon="account-circle"
            size={50}
            onPress={() => navigation.navigate("Profile")}
            style={{ backgroundColor: "#ddd", borderRadius: 50 }}
          />
        )}
      </View>

      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: "#000" },
          tabBarActiveTintColor: "#fff",
          tabBarInactiveTintColor: "#aaa",
        }}
      >
        <Tab.Screen
          name="Cours"
          component={CoursScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="show-chart" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Transaction"
          component={TransactionScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <FontAwesome5 name="exchange-alt" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Portefeuille"
          component={PortefeuilleScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="account-balance-wallet" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

export default HomeScreen;