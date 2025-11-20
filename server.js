import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Facebook Backend OK 🚀");
});

app.listen(3000, () => {
  console.log("Serveur en écoute sur le port 3000");
});
