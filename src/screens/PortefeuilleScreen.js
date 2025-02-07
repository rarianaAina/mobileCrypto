import React, { useState, useEffect, useContext } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { getUserInfoFromRealtimeDb } from "../context/firebase";
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';  // Import LinearGradient

const PortefeuilleScreen = () => {
  const { user } = useContext(AuthContext);
  const [solde, setSolde] = useState(0);
  const [cryptos, setCryptos] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.email) {
      const encodedEmail = user.email.replace(/\./g, ",");
      getUserInfoFromRealtimeDb(encodedEmail, (data) => {
        if (data) {
          setSolde(data.solde);
          setCryptos(Object.keys(data.cryptos).map((key) => ({
            nom: key,
            quantite: data.cryptos[key].quantite,
            valeurAchat: data.cryptos[key].valeur_achat,
          })));
          const loadedTransactions = Object.keys(data.transactions || {}).map((key) => ({ id: key, ...data.transactions[key] }));
          setTransactions(loadedTransactions);
        }
        setLoading(false);
      });
    }
  }, [user]);

  if (loading) {
    return <ActivityIndicator size="large" color="#ffb700" style={styles.loader} />;
  }

  const renderCrypto = ({ item }) => (
    <View style={styles.cryptoContainer}>
      <Text style={styles.cryptoText}><MaterialIcons name="monetization-on" size={20} color="#ffb700" /> {item.nom}</Text>
      <Text style={styles.cryptoText}>Quantité: {item.quantite}</Text>
      <Text style={styles.cryptoText}>Valeur: {item.quantite * item.valeurAchat} €</Text>
    </View>
  );

  const renderTransaction = ({ item }) => (
    <View style={[styles.transactionContainer, item.type === "achat" ? styles.buy : styles.sell]}>
      <Text style={styles.transactionText}>{item.type === "achat" ? "🟢 Achat" : "🔴 Vente"}</Text>
      <Text style={styles.transactionText}>{item.crypto} - {item.quantite} unités</Text>
      <Text style={styles.transactionText}>Prix: {item.prix} €</Text>
      <Text style={styles.transactionText}>Date: {new Date(item.date).toLocaleString()}</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={["#333", "#000"]}  // Gradient from dark grey to darker grey
      style={styles.container}
    >
      <Text style={styles.title}>💼 Portefeuille</Text>
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceText}>💰 {solde} €</Text>
      </View>

      <Text style={styles.sectionTitle}>📈 Cryptos</Text>
      <FlatList
        data={cryptos}
        renderItem={renderCrypto}
        keyExtractor={(item) => item.nom}
      />

      <Text style={styles.sectionTitle}>💸 Transactions</Text>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", color: "white", marginBottom: 20, marginTop: 40 },
  balanceContainer: { backgroundColor: "#222", padding: 15, borderRadius: 10, alignItems: "center", marginBottom: 20 },
  balanceText: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#ffb700", marginVertical: 10, textAlign: "center" },
  cryptoContainer: { backgroundColor: "#333", padding: 15, borderRadius: 8, marginBottom: 10 },
  cryptoText: { fontSize: 16, color: "#fff" },
  transactionContainer: { padding: 15, borderRadius: 8, marginBottom: 10 },
  buy: { backgroundColor: "#154734" },
  sell: { backgroundColor: "#781414" },
  transactionText: { fontSize: 16, color: "#fff" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" }
});

export default PortefeuilleScreen;
