import React, { useContext } from "react";
import { View, ActivityIndicator } from "react-native";
import { AuthContext } from "../context/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";

const PrivateRoute = () => {
  const { user } = useContext(AuthContext);

  if (user === undefined) return <ActivityIndicator size="large" />;

  return user ? <HomeScreen /> : <LoginScreen />;
};

export default PrivateRoute;
