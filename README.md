# StockNSELL - Laboratorio06-Web
 Plataforma web de gestión de inventario y ventas, con autenticación (incluyendo Google), panel de administración, pedidos, carrito, favoritos y subida de imágenes a Supabase.

---

 ### Estructura del Proyecto

```
/mongo-node-lab      # Backend (Express, Mongoose, lógica de negocio, modelos, autenticación)
/frontend            # Frontend (Next.js, React, TailwindCSS)
/server.js           # Servidor Express principal (punto de entrada backend)
```

---

### Configuración del Backend

**Instala las dependencias**  
   Desde la raíz del proyecto:

   ```sh
   npm install
   cd mongo-node-lab
   npm install
   ```


**Configura variables de entorno**  

MONGO_URI=...
JWT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...


**Ejecuta el backend**  
   Desde la raíz del proyecto:

   ```sh
   node server.js
   ```


Se usa servicios como MongoDB Atlas
Gerenamos tockens por cuestiones de seguridad
Usamos los servicios de Google para la autenticacion e inicio de sesion

---

## Configuración del Frontend

**Instala las dependencias**  
 Desde la carpeta `frontend`:

   ```sh
   npm install
   ```

---


**Ejecuta el frontend**  

   ```sh
   npm run dev
   ```

   El frontend corre por defecto en el puerto `3000`.

---

## Funcionalidades Principales

- **Autenticación**: Registro, login, login con Google, JWT, roles (usuario/admin).
- **Gestión de productos**: CRUD de productos (admin), subida de imágenes a Supabase.
- **Gestión de categorías y proveedores**.
- **Carrito de compras y favoritos** (localStorage).
- **Pedidos**: Creación, historial, cambio de estado (admin y usuario).
- **Panel de administración**: Gestión de productos y proveedores.
- **Frontend moderno**: Next.js, React, TailwindCSS, Axios, animaciones con Framer Motion.

---

## Comandos Útiles

### Backend

```sh
node server.js
```

### Frontend

```sh
cd frontend
npm run dev
```

---

## Notas

- El backend implementa CORS seguro, validación de datos, rate limiting y Helmet.
- Las imágenes de productos se almacenan en Supabase Storage.
- El frontend y backend pueden desplegarse en Vercel y Render respectivamente.
- Para pruebas locales, asegúrate de tener configuradas todas las variables de entorno.

---