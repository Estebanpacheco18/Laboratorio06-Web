# Laboratorio06-Web
 Desarrollo del laboratorio 6 (Antes)

 ### Estructura del Proyecto

/mongo-node-lab      # Backend (Express, Mongoose, lógica de negocio)
/frontend            # Frontend (Next.js)
server.js            # Servidor Express principal

---

### Configuración del Backend

Instalación de dependencias

En la raíz del backend (mongo-node-lab):

npm install express mongoose bcryptjs jsonwebtoken passport passport-google-oauth20 cors dotenv


### Edita .env:

MONGO_URI=...
JWT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

---

Se usa servicios como MongoDB Atlas
Gerenamos tockens por cuestiones de seguridad
Usamos los servicios de Google para la autenticacion e inicio de sesion

---
### Instalar Axios en el frontend

cd frontend
npm install axios

---


## Comandos para ejecutar el proyecto

### Ejecutar el backend

Desde la raíz del proyecto:

node server.js


### Ejecutar el frontend

Desde la carpeta frontend:

npm run dev

---
