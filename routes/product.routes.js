const express = require('express');
const router = express.Router();
const {
  subirProducto,
  crearProducto,
  obtenerProductos,
  obtenerProducto,
  eliminarProducto,
  actualizarProducto
} = require('../controllers/product.controller');

router.get('/', obtenerProductos);
router.get('/:id', obtenerProducto);
router.post('/', subirProducto, crearProducto);
router.put('/:id', subirProducto, actualizarProducto);
router.delete('/:id', eliminarProducto);

module.exports = router;
