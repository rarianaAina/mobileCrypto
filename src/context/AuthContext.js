import React, { createContext, useState, useEffect } from 'react';
import { auth } from './firebase'; 
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'; // Suivre l'état de connexion et déconnexion

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe; // Se désabonner lorsque le composant est démonté
  }, []);

  const signOut = () => {
    firebaseSignOut(auth)
      .then(() => {
        console.log("Utilisateur déconnecté");
      })
      .catch((error) => {
        console.error("Erreur de déconnexion : ", error);
      });
  };

  return (
    <AuthContext.Provider value={{ user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
