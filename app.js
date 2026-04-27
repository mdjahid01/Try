import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// AUTH

window.signup = async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  const user = await createUserWithEmailAndPassword(auth, email, password);

  await addDoc(collection(db, "users"), {
    uid: user.user.uid,
    email: email
  });
};

window.login = async () => {
  await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
};

window.logout = () => signOut(auth);

// STATE

onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("auth").style.display = "none";
    document.getElementById("app").style.display = "block";
    loadProfiles();
    loadChat();
  } else {
    document.getElementById("auth").style.display = "block";
    document.getElementById("app").style.display = "none";
  }
});

// PROFILES (simple swipe system)

async function loadProfiles() {
  const querySnapshot = await getDocs(collection(db, "users"));
  const profilesDiv = document.getElementById("profiles");
  profilesDiv.innerHTML = "";

  querySnapshot.forEach(doc => {
    const data = doc.data();
    const div = document.createElement("div");

    div.innerHTML = `
      <p>${data.email}</p>
      <button onclick="likeUser('${data.uid}')">❤️ Like</button>
    `;

    profilesDiv.appendChild(div);
  });
}

window.likeUser = async (uid) => {
  await addDoc(collection(db, "likes"), {
    to: uid,
    from: auth.currentUser.uid
  });
};

// CHAT (global room)

function loadChat() {
  const chatDiv = document.getElementById("chat");

  onSnapshot(collection(db, "messages"), (snapshot) => {
    chatDiv.innerHTML = "";
    snapshot.forEach(doc => {
      const msg = doc.data();
      chatDiv.innerHTML += `<p>${msg.text}</p>`;
    });
  });
}

window.sendMessage = async () => {
  const msg = document.getElementById("message").value;

  await addDoc(collection(db, "messages"), {
    text: msg
  });
};