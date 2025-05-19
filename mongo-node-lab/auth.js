const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/user');

const SECRET = process.env.JWT_SECRET || 'secreto';

async function register(nombre, email, password) {
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ nombre, email, password: hashed });
  return user;
}

async function login(email, password) {
  const user = await User.findOne({ email });
  if (!user) throw new Error('El usuario no ha sido encontrado');
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('La contraseña es incorrecta');
  // Genera los tokens
  const token = jwt.sign({ id: user._id, email: user.email }, SECRET, { expiresIn: '1h' });
  return { user, token };
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

module.exports = { register, login, authMiddleware, requireAdmin };