const { admin ,db } = require("./admin");

module.exports = (req, res, next) => {
  let idToken;
  let part1, part2;
  part1 = req.headers.authorization;
  part2 = req.headers.authorization.startsWith("Bearer ");
  if (part1 && part2) {
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
      return res.status(403).json(err);
    });
};
