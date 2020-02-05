const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = require("express")();
const firebase = require("firebase");
admin.initializeApp();
const db = admin.firestore();
const firebaseConfig = {
  apiKey: "AIzaSyApCLCOdgwcdpvMQhEdeczgaXm9IHIBZBI",
  authDomain: "webproject-f896a.firebaseapp.com",
  databaseURL: "https://webproject-f896a.firebaseio.com",
  projectId: "webproject-f896a",
  storageBucket: "webproject-f896a.appspot.com",
  messagingSenderId: "1034456639516",
  appId: "1:1034456639516:web:998100ee7aa86137b857d9",
  measurementId: "G-2T7W05328N"
};

firebase.initializeApp(firebaseConfig);

//
const FBAuth = (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    return res.status(403).json({ error: "Unauthorized" });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodedToken => {
      req.user = decodedToken;
      return db
        .collection("users")
        .where("userId", "==", req.user.uid)
        .limit(1)
        .get();
    })
    .then(data => {
      req.user.handle = data.docs[0].data().handle;
      return next();
    })
    .catch(err => {
      console.error("error while verifying token", err);
    });
};

const isEmail = email => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) {
    return true;
  } else {
    return false;
  }
};

const isEmpty = string => {
  if (string.trim() === "") {
    return true;
  } else {
    return false;
  }
};

//

//================= 1 ==================
app.get("/screams", (req, res) => {
  let screams = [];
  db.collection("screams")
    .orderBy("createAt", "desc")
    .get()
    .then(data => {
      // se esta almacenado en el array screams
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

//================= 2 ==================
app.post("/scream", FBAuth, (req, res) => {
  if (req.body.body.trim() === "") {
    return res.status(400).json({ body: "body must not be empty" });
  }

  const newScream = {
    body: req.body.body,
    userHandle: req.user.handle,
    createAt: new Date().toISOString()
  };

  db.collection("screams")
    .add(newScream)
    .then(doc => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch(err => {
      res.status(500).json({ error: "somethine went wrong " });
      console.error(err);
    });
});
//================= 3 ==================

app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };
 // Validacion
  let errors = {};
 
  if (isEmpty(newUser.email)) {
    errors.mail = "Must not be empty";
  } else if (!isEmail(newUser.email)) {
    errors.email = "Must be a valid email  address";
  }

  if (isEmpty(newUser.password)) {
    errors.password = "Must not br empty";
  }

  if (newUser.password !== newUser.confirmPassword) {
    errors.confirmPassword = "Passwords must match";
  }

  if (isEmpty(newUser.handle)) {
    errors.handle = "Must not be empty";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  let token, userId;

  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({ handle: "this handle is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idToken => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(data => {
      return res.status(201).json({ token });
    })
    .catch(err => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ emial: "Email is already is use" });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
});
//================= 4 ==================
app.post("/login", (req, res) => {

  const user = {
    email: req.body.email,
    password: req.body.password
  };

  let errors = {};

  if (isEmpty(user.email)) {
    errors.email = "Must not be empty";
  }

  if (isEmpty(user.password)) {
    errors.password = "Must not be empty";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({ token });
    })
    .catch(err => {
   
      if (err.code === "auth/wrong-password") {
        return res
          .status(403)
          .json({ general: "Wrong credentials , please try again" });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
});
//=================  ==================
exports.api = functions.https.onRequest(app);
