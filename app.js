require('dotenv').config();   // Primero carga las variables de entorno

const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/product.routes');
const sequelize = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/api/productos', productRoutes);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

sequelize.sync()
  .then(() => {
    console.log('Base de datos sincronizada');
  })
  .catch(err => {
    console.error('Error al sincronizar BD:', err);
  });
