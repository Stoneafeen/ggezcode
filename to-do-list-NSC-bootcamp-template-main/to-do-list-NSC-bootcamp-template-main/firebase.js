const firebaseConfig = {
  apiKey: "AIzaSyDVB9NTZlRNIOzHL2jhBuyStt-0N-iwH10",
  authDomain: "to-do-15-e998e.firebaseapp.com",
  projectId: "to-do-15-e998e",
  storageBucket: "to-do-15-e998e.firebasestorage.app",
  messagingSenderId: "569392072579",
  appId: "1:569392072579:web:dab4c4d2eab396083f18b6",
  measurementId: "G-NNJSBWFPF9"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Save task
function saveToFirestore(task) {
  db.collection("tasks")
    .add(task)
    .then(() => console.log("✅ Task saved"))
    .catch((err) => console.error("Error saving:", err));
}

// Load tasks
function loadTasksFromFirestore(callback) {
  db.collection("tasks").onSnapshot((snapshot) => {
    const data = [];
    snapshot.forEach((doc) => {
      data.push({ firestoreId: doc.id, ...doc.data() });
    });
    callback(data);
  });
}

// Update task
function updateTaskInFirestore(id, updates) {
  db.collection("tasks")
    .doc(id)
    .update(updates)
    .then(() => console.log("✅ Task updated"))
    .catch((err) => console.error("Update failed:", err));
}

// Delete task
function deleteTaskFromFirestore(id) {
  db.collection("tasks")
    .doc(id)
    .delete()
    .then(() => console.log("🗑️ Task deleted"))
    .catch((err) => console.error("Delete failed:", err));
}
