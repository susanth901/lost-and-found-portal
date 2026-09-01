import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCf_FE-ME3otV8fsviBKPPBkk3L5yAZ0xU",
    authDomain: "lostandfound-82a6f.firebaseapp.com",
    projectId: "lostandfound-82a6f",
    storageBucket: "lostandfound-82a6f.firebasestorage.app",
    messagingSenderId: "117803341431",
    appId: "1:117803341431:web:8c08c61f3354a24a381872",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export {
    auth,
    googleProvider,
};