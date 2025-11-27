import express from "express";
import axios from "axios";
import Stripe from "stripe";
import cors from "cors";

const app = express();
app.use(express.json());

// -----------------------------------------
// 🛠️ CORS — AUTORISE ton site
// -----------------------------------------
app.use(cors({
  origin: "https://noyer.io",
  methods: ["GET", "POST"],
}));

// -----------------------------------------
// 🔐 FACEBOOK CONFIG
// -----------------------------------------
const APP_ID = "2451194691945458";
const APP_SECRET = process.env.APP_SECRET_FACEBOOK;
const REDIRECT_URI = "https://noyer-facebook-backend.onrender.com/auth/facebook/callback";

const FRONT_REDIRECT_BASIC = "https://noyer.io/basic-connect-facebook.html?connected=true";
const FRONT_REDIRECT_PREMIUM = "https://noyer.io/premium-connect-facebook.html?connected=true";
const FRONT_REDIRECT_BUSINESS = "https://noyer.io/business-connect-facebook.html?connected=true";

// 📌 Stockage du token Facebook
let FACEBOOK_ACCESS_TOKEN = null;


// -----------------------------------------
// 💳 STRIPE CONFIG
// -----------------------------------------
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// -----------------------------------------
// ROUTE TEST
// -----------------------------------------
app.get("/", (req, res) => {
  res.send("API Backend OK 🚀");
});


// -----------------------------------------
// FACEBOOK CALLBACK
// -----------------------------------------
app.get("/auth/facebook/callback", async (req, res) => {
  try {
    const code = req.query.code;
    const state = req.query.state;

    if (!code) return res.status(400).send("Code OAuth manquant");

    const tokenResponse = await axios.get(
      "https://graph.facebook.com/v19.0/oauth/access_token",
      {
        params: {
          client_id: APP_ID,
          client_secret: APP_SECRET,
          redirect_uri: REDIRECT_URI,
          code,
        }
      }
    );

    FACEBOOK_ACCESS_TOKEN = tokenResponse.data.access_token;
    console.log("✔ Token Facebook sauvegardé :", FACEBOOK_ACCESS_TOKEN);


    // ------------------------------
    // BASIC / PREMIUM / BUSINESS
    // ------------------------------
    if (state === "premium_secure_456") {
      return res.redirect(FRONT_REDIRECT_PREMIUM);
    }

    if (state === "business_secure_789") {
      return res.redirect(FRONT_REDIRECT_BUSINESS);
    }

    return res.redirect(FRONT_REDIRECT_BASIC);

  } catch (err) {
    console.log("❌ Erreur Facebook:", err.response?.data || err.message);
    return res.status(500).send("Erreur lors de la connexion Facebook");
  }
});


// -----------------------------------------
// 🔥 ENVOI AU WEBHOOK n8n
// -----------------------------------------
app.post("/send-infos-to-webhook", async (req, res) => {
  try {
    if (!FACEBOOK_ACCESS_TOKEN) {
      return res.status(400).json({ error: "Token Facebook absent" });
    }

    const payload = {
      ...req.body,
      facebookToken: FACEBOOK_ACCESS_TOKEN,
    };

    console.log("📤 Envoi au Webhook n8n…", payload);

    await axios.post(
      "https://pierre07.app.n8n.cloud/webhook/infosclients",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("✔ Webhook envoyé avec succès");
    return res.json({ status: "ok" });

  } catch (err) {
    console.log("❌ Erreur Webhook:", err.message);
    return res.status(500).json({ error: err.message });
  }
});



// -----------------------------------------
// 💳 STRIPE BASIC
// -----------------------------------------
app.post("/create-checkout-session", async (req, res) => {
  try {

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        { price: "price_1SYAGBIYNz8atWR7gDFSGLng", quantity: 1 }
      ],
      success_url: "https://noyer.io/success.html",
      cancel_url: "https://noyer.io/cancel.html",
    });

    return res.json({ url: session.url });

  } catch (err) {
    console.log("❌ Erreur Stripe BASIC:", err.message);
    return res.status(500).json({ error: err.message });
  }
});



// -----------------------------------------
// 💳 STRIPE PREMIUM
// -----------------------------------------
app.post("/create-checkout-session-premium", async (req, res) => {
  try {

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        { price: "price_1SWxDMIYNz8atWR7t03yEc7M", quantity: 1 }
      ],
      success_url: "https://noyer.io/success.html",
      cancel_url: "https://noyer.io/cancel.html",
    });

    return res.json({ url: session.url });

  } catch (err) {
    console.log("❌ Erreur Stripe PREMIUM:", err.message);
    return res.status(500).json({ error: err.message });
  }
});



// -----------------------------------------
// 💳 STRIPE BUSINESS
// -----------------------------------------
app.post("/create-checkout-session-business", async (req, res) => {
  try {

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        { price: "price_1SWxDoIYNz8atWR7MTlLP9zR", quantity: 1 }
      ],
      success_url: "https://noyer.io/success.html",
      cancel_url: "https://noyer.io/cancel.html",
    });

    return res.json({ url: session.url });

  } catch (err) {
    console.log("❌ Erreur Stripe BUSINESS:", err.message);
    return res.status(500).json({ error: err.message });
  }
});



// -----------------------------------------
// SERVEUR
// -----------------------------------------
app.listen(3000, () => {
  console.log("🔥 Backend Noyer en écoute sur le port 3000");
});
