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
};
