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
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Configuración de seguridad y CORS
app.use(helmet());

const allowedOrigins = [
  'http://localhost:3000',
  'https://laboratorio06-web-1mho.vercel.app',
  'https://laboratorio06-web-1mho-git-main-estebanpacheco18s-projects.vercel.app'
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
      google: true // <-- marca como usuario Google
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
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://laboratorio06-web-1mho.vercel.app';

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
    const productos = await models.Producto.find()
      .populate('categoriaId')
      .populate('proveedorId')
      .lean();
    const productosConDatos = productos.map(p => ({
      ...p,
      categoria: p.categoriaId ? p.categoriaId.nombre : null,
      proveedor: p.proveedorId
        ? { nombre: p.proveedorId.nombre, email: p.proveedorId.email }
        : null
    }));
    res.json(productosConDatos);
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
const upload = multer({ storage: multer.memoryStorage() }); // Usar memoria, no disco

app.post('/api/upload', upload.single('imagen'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se subió ninguna imagen' });

  const fileExt = req.file.originalname.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET)
    .upload(filePath, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false
    });

  if (error) {
    return res.status(500).json({ error: 'Error al subir la imagen a Supabase' });
  }

  const { data } = supabase.storage
    .from(process.env.SUPABASE_BUCKET)
    .getPublicUrl(filePath);

  res.json({ url: data.publicUrl });
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

// Obtener pedidos del usuario autenticado
app.get('/api/myorders', authMiddleware, async (req, res) => {
  try {
    const pedidos = await models.Pedido.find({ userId: req.user.id })
      .populate('productos.productoId')
      .lean();
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

// Cambiar estado de un pedido
app.put('/api/myorders/:id', authMiddleware, async (req, res) => {
  try {
    const pedido = await models.Pedido.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { estado: req.body.estado },
      { new: true }
    );
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(pedido);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/orders', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const pedidos = await models.Pedido.find()
      .populate('userId', 'nombre email')
      .populate('productos.productoId', 'nombre')
      .lean();
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

app.put('/api/admin/orders/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    console.log('Admin update pedido ID:', req.params.id);
    const pedido = await models.Pedido.findByIdAndUpdate(
      req.params.id,
      { estado: req.body.estado },
      { new: true }
    );
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(pedido);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Crear un nuevo pedido
app.post('/api/orders', authMiddleware, async (req, res) => {
  try {
    const { productos, total } = req.body;
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: 'Productos requeridos' });
    }

    // Validar y actualizar stock
    for (const item of productos) {
      const producto = await models.Producto.findById(item.productoId);
      if (!producto) {
        return res.status(404).json({ error: `Producto no encontrado: ${item.productoId}` });
      }
      if (producto.stock < item.cantidad) {
        return res.status(400).json({ error: `Stock insuficiente para ${producto.nombre}` });
      }
      producto.stock -= item.cantidad;
      await producto.save();
    }

    const pedido = await models.Pedido.create({
      userId: req.user.id,
      productos,
      total,
      estado: 'pendiente'
    });
    res.json(pedido);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/providers', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const proveedores = await models.Proveedor.find().lean();
    res.json(proveedores);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
connectMongoose().then(() => {
  app.listen(PORT, () => console.log(`Servidor Express en puerto ${PORT}`));
});