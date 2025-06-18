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
const multer = require('multer');
const path = require('path');

const app = express();

// Configuración de seguridad y CORS
app.use(helmet());

const allowedOrigins = [
  'http://localhost:3000',
  'https://laboratorio06-web-1mho-hp0bqpze0-estebanpacheco18s-projects.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Configuración de Passport Google
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'https://laboratorio06-web-backend.onrender.com/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ email: profile.emails[0].value });
  if (!user) {
    user = await User.create({
      nombre: profile.displayName,
      email: profile.emails[0].value,
      password: 'google'
    });
  }
  return done(null, user);
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'otroSecreto',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Rutas de autenticación
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://laboratorio06-web-ghpb.vercel.app';

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos' });
  }
  try {
    const { user, token } = await login(email, password);
    res.json({ user, token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: true }),
  (req, res) => {
    const nombre = req.user.nombre;
    const email = req.user.email;
    const rol = req.user.rol || 'user';
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: req.user._id, email, rol },
      process.env.JWT_SECRET || 'secreto',
      { expiresIn: '1h' }
    );
    res.redirect(
      `${FRONTEND_URL}/account?nombre=${encodeURIComponent(nombre)}&email=${encodeURIComponent(email)}&rol=${encodeURIComponent(rol)}&token=${encodeURIComponent(token)}`
    );
  }
);

// Registro usuario
app.post('/api/register',
  [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
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

// Productos públicos
app.get('/api/products', async (req, res) => {
  try {
    const productos = await models.Producto.find().populate('categoriaId').lean();
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

// Limitar intentos de login/registro
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados intentos, intenta más tarde.' }
});
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);

// Admin: CRUD productos
app.post('/api/admin/products', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const producto = await models.Producto.create(req.body);
    res.json(producto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/admin/products/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const producto = await models.Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(producto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/products/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    await models.Producto.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/products', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const productos = await models.Producto.find().lean();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Subida de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'mongo-node-lab/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpg, jpeg, png, gif)'));
  }
};
const upload = multer({ storage, fileFilter });

app.post('/api/upload', upload.single('imagen'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se subió ninguna imagen' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// Servir archivos estáticos de la carpeta uploads con CORS
app.use('/uploads', (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(__dirname + '/mongo-node-lab/uploads'));

// Iniciar servidor
const PORT = process.env.PORT || 3001;
connectMongoose().then(() => {
  app.listen(PORT, () => console.log(`Servidor Express en puerto ${PORT}`));
});