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
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { authMiddleware, requireAdmin } = require('./mongo-node-lab/auth');


const app = express();

// Permite peticiones desde el frontend Next.js
app.use(helmet()); // Mejora la seguridad de la app
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

// Para el usuario
// Endpoint para login con usuario y contraseña
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  // Validación básica
  if (!email || !password) {
    console.warn('Intento de login inválido:', {
      ip: req.ip,
      body: req.body
    });
    return res.status(400).json({ error: 'Email y contraseña requeridos' });
  }
  try {
    const { user, token } = await login(email, password);
    res.json({ user, token });
  } catch (err) {
    console.warn('Login fallido:', {
      ip: req.ip,
      email,
      error: err.message
    });
    res.status(401).json({ error: err.message });
  }
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Ruta de callback de Google
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: true }),
  (req, res) => {
    // Redirige al frontend con el nombre como query param
    const nombre = req.user.nombre;
    res.redirect(`http://localhost:3000/?nombre=${encodeURIComponent(nombre)}`);
  }
);

app.post('/api/register',
  [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Log de intento fallido o posible inyección
      console.warn('Intento de registro inválido:', {
        ip: req.ip,
        body: req.body,
        errors: errors.array()
      });
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    try {
      const user = await register(req.body.nombre, req.body.email, req.body.password);
      res.json({ user });
    } catch (err) {
      console.error('Error en registro:', err);
      res.status(400).json({ error: err.message });
    }
  }
);

app.get('/api/products', async (req, res) => {
  try {
    const productos = await models.Producto.find().populate('categoriaId').lean();
    // Cambia la estructura para que cada producto tenga un campo 'categoria' con el nombre
    const productosConCategoria = productos.map(p => ({
      ...p,
      categoria: p.categoriaId ? p.categoriaId.nombre : null
    }));
    res.json(productosConCategoria);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const categorias = await models.Categoria.find().lean();
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const producto = await models.Producto.findById(req.params.id).lean();
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// Limita a 5 intentos por IP cada 15 minutos
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por ventana
  message: { error: 'Demasiados intentos, intenta más tarde.' }
});

app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);

// --------------------------------------------------------------------------------------
// Middleware para verificar el rol de administrador y lo que hace el admin
// Crear producto (solo admin)
app.post('/api/admin/products', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const producto = await models.Producto.create(req.body);
    res.json(producto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Actualizar producto (solo admin)
app.put('/api/admin/products/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const producto = await models.Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(producto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar producto (solo admin)
app.delete('/api/admin/products/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    await models.Producto.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Recuperar todos los productos (admin, pero puedes dejarlo público si quieres)
app.get('/api/admin/products', authMiddleware, requireAdmin, async (req, res) => {
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