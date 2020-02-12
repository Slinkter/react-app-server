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
          createdAt: doc.data().createAt,
          commentCount : doc.data().comments,
          likeCount : doc.data().likeCount,
          userImage : doc.data().userImage
        });
      });
      return res.json(screams);
    })
    .catch(err => {
      console.error(err);
    });
};
//
exports.postOneScream = (req, res) => {
  if (req.body.body.trim() === "") {
    return res.status(400).json({
      body: "body must not be empty"
    });
  }

  const newScream = {
    body: req.body.body,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
    createAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0
  };

  db.collection("screams")
    .add(newScream)
    .then(doc => {
      const resScream = newScream;
      resScream.screamId = doc.id;
      res.json(resScream);
    })
    .catch(err => {
      res.status(500).json({
        error: "somethine went wrong "
      });
      console.error(err);
    });
};
//
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
    return res.status(400).json({ comment : "must not be empty" });
  }
  //
  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    screamId: req.params.screamId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl
  };
  //
  db.doc(`/screams/${req.params.screamId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({
          error: "Collecion Screams :  doc scream not found"
        });
      } else {
        return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
      }
    })
    .then(() => {
      return db.collection("comments").add(newComment);
    })
    .then(() => {
      res.json(newComment);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: "Somethins went wrong " + err.code });
    });
};

exports.likeScream = (req, res) => {
  let screamData;
  //
  const likeDocument = db
    .collection("likes")
    .where("userHandle", "==", req.user.handle)
    .where("screamId", "==", req.params.screamId)
    .limit(1);
  //
  const screamDocument = db.doc(`/screams/${req.params.screamId}`);

  screamDocument
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Scream not found" });
      } else {
        screamData = doc.data();
        screamData.screamId = doc.id;
        return likeDocument.get();
      }
    })
    .then(data => {
      if (data.empty) {
        return db
          .collection("likes")
          .add({
            screamId: req.params.screamId,
            userHandle: req.user.handle
          })
          .then(() => {
            screamData.likeCount++;
            return screamDocument.update({ likeCount: screamData.likeCount });
          });
      } else {
        return res.status(400).json({ error: "Scream already liked" });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.unlikeScream = () => {
  const likeDocument = db
    .collection("likes")
    .where("userHandle", "==", req.user.handle)
    .where("screamId", "==", req.params.screamId)
    .limit(1);
  const screamDocument = db.doc(`/screams/${req.params.screamId}`);

  let screamData;

  screamDocument
    .get()
    .then(doc => {
      if (doc.exists) {
        screamData = doc.data();
        screamData.screamId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "Scream not found" });
      }
    })
    .then(data => {
      if (data.empty) {
        return res.status(400).json({ error: "Scream not liked" });
      } else {
        return db
          .doc(`/likes/${data.docs[0].id}`)
          .delete()
          .then(() => {
            screamData.likeCount--;
            return screamDocument.update({ likeCount: screamData.likeCount });
          })
          .then(() => res.json(screamData));
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};
//
exports.deteleScream = (req, res) => {
  const document = db.doc(`/screams/${req.params.screamId}`);
  document
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Scream not found" });
      }
      if (doc.data().userHandle !== req.user.handle) {
        return res.status(403).json({ error: "Unauthorized" });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({ message: "scream deleted successfully" });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
//
