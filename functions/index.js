const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
//
const firebaseConfig = {
  apiKey: "AIzaSyApCLCOdgwcdpvMQhEdeczgaXm9IHIBZBI",
  authDomain: "webproject-f896a.firebaseapp.com",
  databaseURL: "https://webproject-f896a.firebaseio.com",
  projectId: "webproject-f896a",
  storageBucket: "webproject-f896a.appspot.com",
  messagingSenderId: "1034456639516"
};

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);
//
app.get("/screams", (req, res) => {
  admin
    .firestore()
    .collection("screams")
    .orderBy("createAt", "desc")
    .get()
    .then(data => {
      let screams = [];
      data.forEach(doc => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createAt
        });
      });
      return res.json(screams);
    })
    .catch(err => console.error(err));
});
//
app.post("/scream", (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createAt: new Date().toISOString()
  };

  admin
    .firestore()
    .collection("screams")
    .add(newScream)
    .then(doc => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch(err => {
      res.status(500).json({ error: "somethine went wrong " });
      console.error(err);
    });
});

app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };
});

firebase
  .auth()
  .createUserWithEmailAndPassword(newUser.email, newUser.password)
  .then(data => {
    return res
      .status(201)
      .json({ message: ` user ${data.user.uid} signed up sucessfully ` });
  })
  .catch(err => {
    console.error(err);
    return res.status(500).json({ error: err.code });
  });

exports.api = functions.region("us-east1").https.onRequest(app);
