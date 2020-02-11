const functions = require("firebase-functions");
const app = require("express")();
const { db } = require("./util/admin");
//
const FBAuth = require("./util/fbAuth.js");
const {
  getAllScreams,
  postOneScream,
  getScream,
  commentOnScream,
  likeScream,
  unlikeScream,
  deteleScream
} = require("./handlers/screams");
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
  getUserDetails,
  markNotificationsRead
} = require("./handlers/users");
//================= 1 ==================
app.get("/screams", getAllScreams);
//================= 2 ==================
app.post("/scream", FBAuth, postOneScream);
//================= 3 ==================
app.post("/signup", signup);
//================= 4 ==================
app.post("/login", login);
//=================  ==================
app.post("/user/image", FBAuth, uploadImage);
//=================  ==================
app.post("/user", FBAuth, addUserDetails);
//=================  ==================
app.get("/user", FBAuth, getAuthenticatedUser);
//=================  ==================
app.get("/scream/:screamId", getScream);
//=================  ==================
app.post("/scream/:screamId/comment", FBAuth, commentOnScream);
//=================  ==================∆≤≤
app.get("/scream/:screamId/like", FBAuth, likeScream);
//=================  ==================
app.get("/scream/:screamId/unlike", FBAuth, unlikeScream);
//=================  ==================
app.delete("/scream/:screamId", FBAuth, deteleScream);

app.get("user/:handle", getUserDetails);
//
app.post("/notifications", FBAuth, markNotificationsRead);
//=================  ==================
exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions.firestore
  .document("likes/{id}")
  .onCreate(snapshot => {
    db.doc(` /scream/${snapshot.data().screamId}`)
      .get()
      .then(doc => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date.toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "like",
            read: false,
            screamId: doc.id
          });
        }
      })
      .then(() => {
        return;
      })
      .catch(err => {
        console.error(err);
        return;
      });
  });

exports.deleteNotificationOnUnlike = functions.firestore
  .document("likes/{id}")
  .onDelete(snapshot => {
    db.doc(`/notifications/${snapshot.id}`)
      .delete()
      .then(() => {
        return;
      })
      .catch(err => {
        console.error(err);
        return;
      });
  });

exports.createNotificationOnCommnet = functions.firestore
  .document("/comments/{id}")
  .onCreate(snapshot => {
    db.doc(` /scream/${snapshot.data().screamId}`)
      .get()
      .then(doc => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date.toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "comment",
            read: false,
            screamId: doc.id
          });
        }
      })
      .then(() => {
        return;
      })
      .catch(err => {
        console.error(err);
        return;
      });
  });
