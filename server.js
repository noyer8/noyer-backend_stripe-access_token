import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const APP_ID = "2451194691945458";
const APP_SECRET = "79e0c26ce2f3dd8d1b099c239d4ef997"; // ⚠️ remplacé par ton vrai secret
const REDIRECT_URI = "https://noyer-backend.onrender.com/auth/facebook/callback";

app.get("/", (req, res) => {
  res.send("API Facebook Backend OK 🚀");
});

// ----------- CALLBACK FACEBOOK -----------
app.get("/auth/facebook/callback", async (req, res) => {
  try {
    const code = req.query.code;

    if (!code) {
      return res.status(400).send("Code OAuth manquant");
    }

    // 1️⃣ Échanger le code contre un token
    const tokenResponse = await axios.get(
      "https://graph.facebook.com/v19.0/oauth/access_token",
      {
        params: {
          client_id: APP_ID,
          client_secret: APP_SECRET,
          redirect_uri: REDIRECT_URI,
          code: code,
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    console.log("TOKEN FACEBOOK :", accessToken);

    // 2️⃣ STOCKE LE TOKEN OU AUTRE TRAITEMENT ICI
    // TODO: sauvegarde DB, sélection de page, etc.

    // 3️⃣ REDIRECTION VERS TA PAGE FRONTOFFICE
    res.redirect("https://noyer.io/basic-connect-facebook.html");

  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de l'auth Facebook");
  }
});

// ------------------------------------------

app.listen(3000, () => {
  console.log("Serveur en écoute sur le port 3000");
});
