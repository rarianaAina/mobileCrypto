import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, get, child } from "firebase/database";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBPILF0XfaqpmKzfyISsumv42ND1ZBwtQY",
  authDomain: "mobile-s5-ea88f.firebaseapp.com",
  databaseURL: "https://mobile-s5-ea88f-default-rtdb.firebaseio.com/", // Realtime Database
  projectId: "mobile-s5-ea88f",
  storageBucket: "mobile-s5-ea88f.appspot.com",
  messagingSenderId: "10569928860",
  appId: "1:10569928860:web:bfd68b4702436edca46f1a",
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const db = getFirestore(app);
const realtimeDb = getDatabase(app);



/**
 * 🔹 Récupère les données des cryptos et leur historique depuis Firebase Realtime Database en temps réel.
 * @param {function} callback - Fonction appelée lors des mises à jour.
 */
const getCryptoData = (callback) => {
  const cryptoRef = ref(realtimeDb, "cryptos");

  // Écoute en temps réel les changements sur la référence "cryptos"
  onValue(cryptoRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();

      // Trier l'historique des prix par timestamp décroissant
      const timestampedData = Object.keys(data).reduce((acc, cryptoName) => {
        const currentCrypto = data[cryptoName];
        const history = currentCrypto.history || {}; 

        const sortedHistory = Object.values(history).sort((a, b) => b.timestamp - a.timestamp);

        acc[cryptoName] = {
          ...currentCrypto,
          history: sortedHistory,
        };
        return acc;
      }, {});

      callback(timestampedData);
    } else {
      callback({});
    }
  }, (error) => {
    console.error("Error fetching crypto data:", error);
    callback({});
  });
};

// /**
//  * 🔹 Récupère les données des cryptos et leur historique depuis Firebase Realtime Database.
//  * @param {function} callback - Fonction appelée lors des mises à jour.
//  */
// const getCryptoData = (callback) => {
//   const cryptoRef = ref(realtimeDb, "cryptos");

//   // Récupérer toutes les données
//   get(cryptoRef).then((snapshot) => {
//     if (snapshot.exists()) {
//       const data = snapshot.val();

//       // Pour chaque crypto, on va récupérer l'historique trié par timestamp
//       const timestampedData = Object.keys(data).reduce((acc, cryptoName) => {
//         const currentCrypto = data[cryptoName];
//         const history = currentCrypto.history || {}; // Si l'historique existe, on le récupère

//         // Trier l'historique des prix par timestamp décroissant
//         const sortedHistory = Object.values(history).sort((a, b) => b.timestamp - a.timestamp);

//         // Ajouter l'historique trié à l'objet acc
//         acc[cryptoName] = {
//           ...currentCrypto,
//           history: sortedHistory, // Historique trié
//         };
//         return acc;
//       }, {});

//       callback(timestampedData); // Retourner les données avec l'historique trié
//     } else {
//       callback({}); // Si aucune donnée n'existe
//     }
//   }).catch((error) => {
//     console.error("Error fetching crypto data:", error);
//     callback({}); // En cas d'erreur, retourner un objet vide
//   });
// };

/**
 * 🔹 Définit une crypto comme favorite pour un utilisateur.
 * @param {string} userId - UID de l'utilisateur.
 * @param {string} cryptoId - ID de la crypto à mettre en favori.
 */
const setFavorite = async (userId, cryptoId) => {
  try {
    await set(ref(realtimeDb, `favorites/${userId}`), { favorite: cryptoId });
  } catch (error) {
    console.error("Erreur lors de l'ajout aux favoris :", error);
  }
};

/**
 * 🔹 Récupère la crypto favorite d'un utilisateur.
 * @param {string} userId - UID de l'utilisateur.
 * @returns {Promise<string|null>} - ID de la crypto favorite ou null si aucun favori.
 */
const getFavorite = async (userId) => {
  try {
    const snapshot = await get(child(ref(realtimeDb), `favorites/${userId}`));
    if (snapshot.exists()) {
      console.log('Données récupérées :', snapshot.val());
      return snapshot.val().favorite;
    } else {
      console.log('Pas de données disponibles pour cet utilisateur');
      return null;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du favori :", error);
    return null;
  }
};


/**
 * 🔹 Upload une image sur Cloudinary et retourne son URL.
 * @param {string} imageUri - URI de l'image capturée.
 * @returns {Promise<string>} - URL de l'image sur Cloudinary.
 */
const uploadImageToCloudinary = async (imageUri) => {
  const data = new FormData();
  data.append("file", {
    uri: imageUri,
    type: "image/jpeg",
    name: "profile_picture.jpg",
  });
  data.append("upload_preset", "preset_upload"); // Remplace par ton upload preset
  data.append("cloud_name", "dxbvc8i6g"); // Remplace par ton cloud name

  try {
    let response = await fetch(`https://api.cloudinary.com/v1_1/dxbvc8i6g/image/upload`, {
      method: "POST",
      body: data,
    });
    let result = await response.json();
    return result.secure_url; // URL de l'image stockée
  } catch (error) {
    console.error("Erreur lors de l'upload Cloudinary:", error);
    return null;
  }
};

/**
 * 🔹 Stocke l'URL de la photo dans Firestore sous l'UID de l'utilisateur.
 * @param {string} userId - UID de l'utilisateur.
 * @param {string} imageUrl - URL de la photo stockée.
 */
const saveProfileImageUrl = async (userId, imageUrl) => {
  if (!userId || !imageUrl) return;
  
  try {
    await setDoc(doc(db, "users", userId), { profileImageUrl: imageUrl }, { merge: true });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'image:", error);
  }
};

/**
 * 🔹 Récupère l'URL de la photo de profil d'un utilisateur.
 * @param {string} userId - UID de l'utilisateur.
 * @returns {Promise<string | null>} - URL de la photo ou null si non trouvée.
 */
const getProfileImageUrl = async (userId) => {
  if (!userId) return null;
  
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data().profileImageUrl || null;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'image:", error);
  }
  
  return null;
};


/**
 * 🔹 Récupère les données de l'opération depuis Firebase Realtime Database.
 * @param {function} callback - Fonction appelée lors de la mise à jour des données.
 */
const getOperation = (callback) => {
  const operationRef = ref(realtimeDb, "operation");

  // Récupérer les données de l'opération
  onValue(operationRef, (snapshot) => {
    if (snapshot.exists()) {
      const operation = snapshot.val();
      console.log('check the operation status',operation);
      callback(operation); // Retourner les données de l'opération
    } else {
      callback(null); // Si aucune opération n'existe
    }
  }, (error) => {
    console.error("Error fetching operation data:", error);
    callback(null); // En cas d'erreur, retourner null
  });
};

/**
 * 🔹 Enregistre une transaction dans la base de données en temps réel Firebase.
 * @param {Object} transactionData - Les données de la transaction (montant, type, etc.).
 * @param {string} type - Le type de transaction (depot ou retrait).
 */
const addTransaction = async (transactionData, type) => {
  try {
    const transactionId = `transaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; // ID unique
    const transactionRef = ref(realtimeDb, `transactions/${type}/${transactionId}`);
    
    // Enregistrer la transaction avec son ID
    await set(transactionRef, {
      ...transactionData,
      id: transactionId
    });
    
    console.log("Transaction ajoutée avec ID: ", transactionId);
  } catch (error) {
    console.error("Erreur lors de l'ajout de la transaction: ", error);
    throw error;
  }
};

/**
 * 🔹 Récupère les informations d'un utilisateur depuis Firebase Realtime Database.
 * @param {string} userEmail - L'email de l'utilisateur (utilisé comme clé dans la base de données).
 * @param {function} callback - Fonction appelée lors de la récupération des données.
 */
const getUserInfoFromRealtimeDb = (userEmail, callback) => {
  const userRef = ref(realtimeDb, `users/${userEmail.replace('.', ',')}`); // Remplace le '.' dans l'email par ',' pour l'utiliser comme clé

  // Récupérer les données de l'utilisateur
  get(userRef).then((snapshot) => {
    if (snapshot.exists()) {
      const userData = snapshot.val(); // Récupère les données de l'utilisateur
      callback(userData); // Retourner les données via le callback
    } else {
      callback(null); // Si l'utilisateur n'existe pas
    }
  }).catch((error) => {
    console.error("Erreur lors de la récupération des informations de l'utilisateur:", error);
    callback(null); // En cas d'erreur, retourner null
  });
};


export {
  app,
  auth,
  db,
  realtimeDb,
  getCryptoData,
  setFavorite,
  getFavorite,
  uploadImageToCloudinary,
  saveProfileImageUrl,
  getProfileImageUrl,
  getOperation,
  addTransaction,
  getUserInfoFromRealtimeDb
};
