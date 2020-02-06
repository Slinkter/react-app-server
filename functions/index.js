const functions = require("firebase-functions");
const app = require("express")();
const FBAuth = require('./util/fbAuth.js')

const { getAllScreams,postOneScream } = require("./handlers/screams");
const { signup, login } = require("./handlers/users");

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
