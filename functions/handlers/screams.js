const { db } = require("../util/admin");

exports.getAllScreams = (req, res) => {
  let screams = [];
  db.collection("screams")
    .orderBy("createAt", "desc") // Obtener los screams desde el ultimo insertado
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
    .catch(err => {
      console.error(err);
    });
};

exports.postOneScream = (req, res) => {
  if (req.body.body.trim() === "") {
    return res.status(400).json({
      body: "body must not be empty"
    });
  }

  const newScream = {
    body: req.body.body,
    userHandle: req.user.handle,
    createAt: new Date().toISOString()
  };

  db.collection("screams")
    .add(newScream)
    .then(doc => {
      res.json({
        message: `document ${doc.id} created successfully`
      });
    })
    .catch(err => {
      res.status(500).json({
        error: "somethine went wrong "
      });
      console.error(err);
    });
};

exports.getScream = (req, res) => {
  let screamData = {};

  db.doc(`/screams/${req.params.screamId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        console.log("!doc.e");
        return res.status(400).json({
          error: "Collection screams : Scream not found"
        });
      }

      screamData = doc.data();
      screamData.screamId = doc.id;
      // obtenemos el id del documento scream
      // y nos vamos a la collection comments
      // y con el id del docuemtnos scream
      // obtenemos todos los comentarios por el screamId
      return db
        .collection("comments")
        .orderBy("createdAt", "desc") // se crear un index en firebase
        .where("screamId", "==", req.params.screamId)
        .get();
    })
    .then(data => {
      screamData.comments = [];
      // almacenarlos los comentarios en un  arreglos

      data.forEach(doc => {
        screamData.comments.push(doc.data());
      });
      // almacenar el array en un json

      return res.json(screamData);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: err.code
      });
    });
};

//
exports.commentOnScream = (req, res) => {
  //
  if (req.body.body.trim() === "") {
    return res.status(400).json({
      error: "must not be empty"
    });
  }
  //
  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    screamId: req.params.screamId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl
  };

  db.doc(`/screams/${req.params.screamId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({
          error: "Collecion Screams :  doc scream not found"
        });
      }
      return db.collection("comments").add(newComment);
    })
    .then(() => {
      res.json(newComment);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: "Somethins went wrong " + err.code
      });
    });
};
