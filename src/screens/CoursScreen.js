import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, TouchableOpacity, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { getCryptoData, getFavorite, setFavorite } from "../context/firebase";
import { AuthContext } from "../context/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";

const CoursScreen = () => {
  const { user } = useContext(AuthContext);
  const [cryptoData, setCryptoData] = useState({});
  const [favorite, setFavoriteCrypto] = useState(null);

  useEffect(() => {
    getCryptoData(setCryptoData);
    if (user?.uid) {
      // console.log('UID de l\'utilisateur:', user.uid);
      getFavorite(user.uid).then(favoriteCrypto => {
        console.log('Dans la base favori:', favoriteCrypto); 
        setFavoriteCrypto(favoriteCrypto); // Mettez à jour directement l'état avec la crypto favorite
      }).catch((error) => {
        console.error('Erreur lors de la récupération du favori:', error);
      });
    }
  }, [user]);


  const handleFavorite = async (cryptoName) => {
    await setFavorite(user.uid, cryptoName);

    setFavoriteCrypto(cryptoName);
    if (user?.uid) {
      getFavorite(user.uid, (data) => {
        const favoriteCrypto = data.favorite;
        setFavoriteCrypto(favoriteCrypto);
      });
    }
  };

  const formatHistory = (history) => {
    // Si l'historique est vide, retourner un graphique vide
    if (history.length === 0) return { labels: [], datasets: [{ data: [] }] };
  
    // Calculer les intervalles entre chaque point de données
    const prices = history.map(item => item.price);
    const timestamps = history.map(item => item.timestamp);
  
    const labels = timestamps.map((timestamp, index) => {
      const now = Date.now();
      const diff = now - timestamp;
  
      // Calculer l'intervalle de temps en secondes
      const diffInSeconds = Math.floor(diff / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
  
      if (diffInSeconds < 60) {
        return `${diffInSeconds}s`;  // Moins de 1 minute
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}m`; // Moins de 1 heure
      } else if (diffInHours < 24) {
        return `${diffInHours}h`; // Moins de 24 heures
      } else {
        const date = new Date(timestamp);
        return `${date.getHours()}:${date.getMinutes()}`; // Affichage de l'heure précise si plus de 24 heures
      }
    });
  
    // Retourner les données formatées pour le graphique
    return {
      labels,
      datasets: [{ data: prices }],
    };
  };
  

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#121212" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", color: "white", marginBottom: 20 , marginTop: 40}}>
        📈 Cours des Cryptos 
      </Text>

      <FlatList
        data={Object.entries(cryptoData)}
        keyExtractor={(item) => item[0]}
        renderItem={({ item }) => {
          const [cryptoName, data] = item;
          const isFavorite = favorite === cryptoName;
          console.log('favorite:', favorite);
          console.log('cryptoName:', cryptoName);
          console.log('isFavorite:', isFavorite);
          
          // Formater les données d'historique
          const chartData = formatHistory(data.history || []); // Assurez-vous que 'data.history' contient un historique de prix

          return (
            <View
              style={{
                backgroundColor: "#1E1E1E",
                padding: 15,
                marginBottom: 15,
                borderRadius: 10,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>
                  {cryptoName.toUpperCase()}
                </Text>

                {/* Icône de Favori ❤️ */}
                <TouchableOpacity onPress={() => handleFavorite(cryptoName)}>
                  <MaterialIcons
                    name={isFavorite ? "favorite" : "favorite-border"}
                    size={30}
                    color={isFavorite ? "red" : "white"}
                  />
                </TouchableOpacity>
              </View>

              <Text style={{ color: "white", marginBottom: 10 }}>💰 Prix: {data.price} USD</Text>

              {/* Graphique */}
              <LineChart
                data={chartData}
                width={Dimensions.get("window").width - 50}
                height={200}
                yAxisSuffix=" $"
                chartConfig={{
                  backgroundGradientFrom: "#333",
                  backgroundGradientTo: "#000",
                  color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  strokeWidth: 2,
                }}
                bezier
              />
            </View>
          );
        }}
      />
    </View>
  );
};

export default CoursScreen;
