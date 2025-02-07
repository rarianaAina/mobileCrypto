import React, { useState, useEffect, useContext } from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { IconButton } from "react-native-paper";
import { AuthContext } from "../context/AuthContext";
import { getProfileImageUrl, getFavorite, getOperation } from "../context/firebase"; // Add getOperation
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
  const [operation, setOperation] = useState(null); // State to store the operation data

  useEffect(() => {
    const loadProfileImage = async () => {
      if (user?.uid) {
        const imageUrl = await getProfileImageUrl(user.uid);
        // console.log('Profile image URL:', imageUrl);  // Log the fetched image URL
        if (imageUrl) setPhoto(imageUrl);
      }
    };
    loadProfileImage();
  }, [user]);

  useEffect(() => {
    if (user?.uid) {
      getFavorite(user.uid).then((favoriteCrypto) => {
        console.log('Favorite crypto fetched:', favoriteCrypto);  // Log favorite crypto
        setFavoriteCrypto(favoriteCrypto);
      });
    }
  }, [user]);

  useEffect(() => {
    getOperation((operationData) => {
      console.log('Operation data fetched:', operationData);  // Log the fetched operation data
      setOperation(operationData); // Update the operation state with the fetched operation data
    });
  }, []); // Fetch operation once on component mount

  useEffect(() => {
    if (operation && favoriteCrypto && operation.cryptoname === favoriteCrypto) {
      console.log('Checking and sending notification for operation:', operation);  // Log operation and crypto match

      const checkAndNotify = async () => {
        const lastNotified = await AsyncStorage.getItem("lastNotified");
        console.log('Last notified ID:', lastNotified);  // Log last notified ID

        if (lastNotified !== String(operation.idTransaction)) {
          console.log('New operation detected, sending notification...');  // Log notification sending
          await AsyncStorage.setItem("lastNotified", String(operation.idTransaction));

          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Nouvelle opération",
              body: `${operation.nomEffectuant} a effectué un ${operation.name} sur votre cryptomonnaie favorite : ${operation.cryptoname}`,
              sound: true,
            },
            trigger: null,
          });
          console.log('Notification scheduled');  // Log after notification is scheduled
        } else {
          console.log('Operation already notified');  // Log if the operation has already been notified
        }
      };

      checkAndNotify();
    }
  }, [operation, favoriteCrypto]); // Re-run the effect if either operation or favoriteCrypto changes

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
