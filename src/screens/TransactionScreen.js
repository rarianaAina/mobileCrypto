import React, { useState, useContext } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { addTransaction } from "../context/firebase";
import { ActivityIndicator } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";

const TransactionScreen = () => {
  const { user } = useContext(AuthContext);
  const [amount, setAmount] = useState("");
  const [transactionType, setTransactionType] = useState("depot");
  const [loading, setLoading] = useState(false);

  const handleTransaction = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      Alert.alert("Erreur", "Veuillez entrer un montant valide.");
      return;
    }

    if (!user?.email) {
      Alert.alert("Erreur", "Utilisateur non authentifié. Veuillez vous connecter.");
      return;
    }

    setLoading(true);

    try {
      const transactionData = {
        mail: user.email,
        montant: parseFloat(amount),
        type: transactionType,
        date: new Date().toISOString(),
      };

      await addTransaction(transactionData, transactionType);
      Alert.alert("Succès", `Demande de ${transactionType} envoyée avec succès.`);
      setAmount("");
    } catch (error) {
      console.error("Erreur lors de l'ajout de la transaction", error);
      Alert.alert("Erreur", "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#333", "#000"]} style={styles.container}>
      <Text style={styles.title}>🤝 Demande</Text>

      <View style={styles.transactionTypeContainer}>
        <Button
          title="Dépôt"
          onPress={() => setTransactionType("depot")}
          color={transactionType === "depot" ? "#4CAF50" : "#888"}
        />
        <Button
          title="Retrait"
          onPress={() => setTransactionType("retrait")}
          color={transactionType === "retrait" ? "#F44336" : "#888"}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Montant"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <Button title="Envoyer la demande" onPress={handleTransaction} />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
    marginTop: 40
  },
  input: {
    backgroundColor: "#444",
    color: "#fff",
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
    fontSize: 16,
  },
  transactionTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 30
  },
});

export default TransactionScreen;
