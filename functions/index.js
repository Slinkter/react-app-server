const functions = require("firebase-functions");
const app = require("express")();
//
const FBAuth = require("./util/fbAuth.js");
const { getAllScreams, postOneScream } = require("./handlers/screams");
const { signup, login ,uploadImage} = require("./handlers/users");
//================= 1 ==================
app.get("/screams", getAllScreams);
//================= 2 ==================
app.post("/scream", FBAuth, postOneScream);
//================= 3 ==================
app.post("/signup", signup);
//================= 4 ==================
app.post("/login", login);
//=================  ==================
app.post('/user/image', FBAuth, uploadImage);
//=================  ==================

exports.api = functions.https.onRequest(app);
