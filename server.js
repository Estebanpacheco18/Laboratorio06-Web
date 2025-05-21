require('dotenv').config({ path: './mongo-node-lab/.env' });
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cors = require('cors');
const { login } = require('./mongo-node-lab/auth');
const { register } = require('./mongo-node-lab/auth');
const User = require('./mongo-node-lab/models/user');
const { connectMongoose } = require('./mongo-node-lab/database');
const { models } = require('./mongo-node-lab/database');

const app = express();

// Permite peticiones desde el frontend Next.js
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ email: profile.emails[0].value });
  if (!user) {
    user = await User.create({
      nombre: profile.displayName,
      email: profile.emails[0].value,
      password: 'google' // No usar para el login local
    });
  }
  return done(null, user);
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

app.use(session({ secret: 'otroSecreto', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Endpoint para login con usuario y contraseña
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { user, token } = await login(email, password);
    res.json({ user, token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// Endpoints para Google OAuth
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect(`http://localhost:3000?nombre=${encodeURIComponent(req.user.nombre)}`);
  }
);

// Endpoint para registrar usuario
app.post('/api/register', async (req, res) => {
  const { nombre, email, password } = req.body;
  try {
    const user = await register(nombre, email, password);
    res.json({ user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const productos = await models.Producto.find().lean();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

connectMongoose().then(() => {
  app.listen(3001, () => console.log('Servidor Express en http://localhost:3001'));
});