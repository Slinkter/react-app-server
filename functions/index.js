const functions = require("firebase-functions");
const app = require("express")();

const { getAllScreams } = require("./handlers/screams");
const { signup, login } = require("./handlers/users");

const db = admin.firestore();
const firebase = require("firebase");

firebase.initializeApp(config);




//

//================= 1 ==================
app.get("/screams", getAllScreams);
//================= 2 ==================
app.post("/scream", FBAuth, postOneScream);
//================= 3 ==================
app.post("/signup", signup);
//================= 4 ==================
app.post("/login", login);
//=================  ==================
exports.api = functions.https.onRequest(app);
