// firebase.js
import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAThG22WNthHCGtQ7Uh_9mkAA9LZyAcvc8',
  authDomain: 'cura-3fad8.firebaseapp.com',
  projectId: 'cura-3fad8',
  storageBucket: 'cura-3fad8.appspot.com', // Fix the storageBucket URL here
  messagingSenderId: '1067253472113',
  appId: '1:1067253472113:web:230336e1702e4a8bc774d0',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
