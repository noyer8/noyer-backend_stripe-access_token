import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// -----------------------------
// 🔐 CONFIG FACEBOOK
// -----------------------------
const APP_ID = "2451194691945458";
const APP_SECRET = "79e0c26ce2f3dd8d1b099c239d4ef997";

const REDIRECT_URI = "https://noyer-backend.onrender.com/auth/facebook/callback";

// Page FRONT où tu veux retourner après la connexion
const FRONT_REDIRECT = "https://noyer.io/basic-connect-facebook.html?connected=true";

// -----------------------------
// ROUTE TEST
// -----------------------------
app.get("/", (req, res) => {
  res.send("API Facebook Backend OK 🚀");
});

// -----------------------------
// 🚀 CALLBACK FACEBOOK
// -----------------------------
app.get("/auth/facebook/callback", async (req, res) => {
  try {
    const code = req.query.code;

    if (!code) {
      return res.status(400).send("Code OAuth manquant ❌");
    }

    // 1️⃣ Échange du code contre un token Facebook
    const tokenResponse = await axios.get(
      "https://graph.facebook.com/v19.0/oauth/access_token",
      {
        params: {
          client_id: APP_ID,
          client_secret: APP_SECRET,
          redirect_uri: REDIRECT_URI,
          code: code,
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    console.log("✔ TOKEN FACEBOOK OBTENU :", accessToken);

    // 👉 Ici tu pourras stocker le token en base si tu veux
    // TODO: sauvegarde DB

    // 2️⃣ Redirection vers ta page front AVEC ?connected=true
    res.redirect(FRONT_REDIRECT);

  } catch (err) {
    console.error("❌ Erreur callback Facebook :", err);
    res.status(500).send("Erreur lors de la connexion Facebook");
  }
});

// -----------------------------
// DÉMARRAGE SERVEUR
// -----------------------------
app.listen(3000, () => {
  console.log("🔥 Serveur backend en écoute sur le port 3000");
});
