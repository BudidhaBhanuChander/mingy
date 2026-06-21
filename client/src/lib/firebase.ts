import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBMQOzarlTS4K31gBOOI1BxMQLkOg6x9zw",
    authDomain: "grocery-prod-2026.firebaseapp.com",
    projectId: "grocery-prod-2026",
    storageBucket: "grocery-prod-2026.firebasestorage.app",
    messagingSenderId: "734119181687",
    appId: "1:734119181687:web:e6bcb6d2f09b48e026f572",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
