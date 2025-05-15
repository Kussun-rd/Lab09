const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');
const Producto = require('../models/product.model');
const s3 = require('../config/aws.config');  // Importa la instancia ya creada
require('dotenv').config();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, 'productos/' + Date.now() + '-' + file.originalname);
    }
  })
});

const subirProducto = upload.single('imagen');

const crearProducto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ mensaje: 'No se ha subido ninguna imagen' });

    const { nombre, descripcion } = req.body;
    const imagenUrl = req.file.location;

    const nuevoProducto = await Producto.create({
      id: uuidv4(),
      nombre,
      descripcion,
      imagenUrl,
      s3Key: req.file.key,
    });

    res.json({ mensaje: 'Producto creado con éxito', producto: nuevoProducto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear producto' });
  }
};

const obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll();
    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener productos' });
  }
};

const obtenerProducto = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener producto' });
  }
};

const eliminarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    await s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: producto.s3Key,
    }).promise();

    await producto.destroy();

    res.json({ mensaje: 'Producto eliminado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar producto' });
  }
};

const actualizarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    const { nombre, descripcion } = req.body;

    if (nombre) producto.nombre = nombre;
    if (descripcion) producto.descripcion = descripcion;

    if (req.file) {
      // Eliminar imagen anterior
      await s3.deleteObject({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: producto.s3Key,
      }).promise();

      // Actualizar con nueva imagen
      producto.imagenUrl = req.file.location;
      producto.s3Key = req.file.key;
    }

    await producto.save();

    res.json({ mensaje: 'Producto actualizado con éxito', producto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar producto' });
  }
};

module.exports = {
  subirProducto,
  crearProducto,
  obtenerProductos,
  obtenerProducto,
  eliminarProducto,
  actualizarProducto,
};
