const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
const Administrador = require('./models/administrador');

const SECRET = process.env.JWT_SECRET || 'secreto';

async function register(nombre, email, password) {
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ nombre, email, password: hashed });
  return user;
}

async function login(email, password) {
  // Busca primero en usuarios normales
  let user = await User.findOne({ email });
  if (user) {
    if (user.google) {
      throw new Error('Este usuario solo puede iniciar sesión con Google');
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('La contraseña es incorrecta');
    // Si el usuario tiene rol, úsalo; si no, default a 'user'
    const rol = user.rol || 'user';
    const token = jwt.sign({ id: user._id, email: user.email, rol }, SECRET, { expiresIn: '1h' });
    return { user: { ...user.toObject(), rol }, token };
  }

  // Si no está en users, busca en administradores
  const admin = await Administrador.findOne({ email });
  if (!admin) throw new Error('El usuario no ha sido encontrado');
  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) throw new Error('La contraseña es incorrecta');
  // Crea un objeto user compatible y agrega rol: 'admin'
  const adminUser = {
    _id: admin._id,
    nombre: admin.nombre,
    email: admin.email,
    rol: 'admin'
  };
  const token = jwt.sign({ id: admin._id, email: admin.email, rol: 'admin' }, SECRET, { expiresIn: '1h' });
  return { user: adminUser, token };
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Token requerido' });
  const token = auth.split(' ')[1];
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user && req.user.rol === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Acceso solo para administradores' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user && req.user.rol === role) {
      next();
    } else {
      res.status(403).json({ error: 'Acceso denegado' });
    }
  };
}

module.exports = { register, login, authMiddleware, requireAdmin, requireRole };