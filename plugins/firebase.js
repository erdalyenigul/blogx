import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyCo7BOnHsNrNUEuLnsNg-GMSpEw9JMgvgI",
  authDomain: "bloggo-95316.firebaseapp.com",
  projectId: "bloggo-95316",
  storageBucket: "bloggo-95316.appspot.com",
  messagingSenderId: "521088021649",
  appId: "1:521088021649:web:73c1854d3a791bab3b7b30"
};

export default !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();
