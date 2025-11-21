import express from "express";
import axios from "axios";
import Stripe from "stripe";

const app = express();
app.use(express.json());

// -----------------------------------------
// 🔐 FACEBOOK CONFIG
// -----------------------------------------
const APP_ID = "2451194691945458";
const APP_SECRET = process.env.APP_SECRET_FACEBOOK;
const REDIRECT_URI = "https://noyer-facebook-backend.onrender.com/auth/facebook/callback";
const FRONT_REDIRECT = "https://noyer.io/basic-connect-facebook.html?connected=true";

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
    if (!code) return res.status(400).send("Code OAuth manquant");

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

    console.log("✔ Token Facebook obtenu");

    return res.redirect(FRONT_REDIRECT);

  } catch (err) {
    console.log("❌ Erreur Facebook:", err.response?.data || err.message);
    return res.status(500).send("Erreur lors de la connexion Facebook");
  }
});

// -----------------------------------------
// 💳 STRIPE CHECKOUT SESSION
// -----------------------------------------
app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        { price: "price_1SVXTtIYNz8atWR79lh2FQiU", quantity: 1 }
      ],
      success_url: "https://noyer.io/success.html",
      cancel_url: "https://noyer.io/cancel.html",
    });

    return res.json({ url: session.url });

  } catch (err) {
    console.log("❌ Erreur Stripe:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------
// SERVEUR
// -----------------------------------------
app.listen(3000, () => {
  console.log("🔥 Backend Noyer en écoute sur le port 3000");
});
