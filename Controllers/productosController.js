import { Producto } from "../Models/productos.js";

// GET /getProductos
export const getProductos = async (req, res) => {
  try {
    
    const productos = await Producto.findAll();
    res.json(productos);
  } catch (error) {

    console.error(error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

// GET /getProducto/:id
export const getProductoById = async (req, res) => {
  try {

    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(producto);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el producto" });
  }
};

// POST /crearProducto
export const crearProducto = async (req, res) => {
  try {

    const datos = req.body;
    if (!datos.nombre || !datos.precio) {
      return res.status(400).json({ error: "Nombre y precio son obligatorios" });
    }
    const nuevoProducto = await Producto.create(datos);
    res.status(201).json(nuevoProducto);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el producto" });
  }
};

// PUT /actualizarProducto/:id
export const actualizarProducto = async (req, res) => {
  try {

    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
    await producto.update(req.body);
    res.json(producto);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
};

// DELETE /eliminarProducto/:id
export const eliminarProducto = async (req, res) => {
  try {

    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
    await producto.destroy();
    res.json({ message: "Producto eliminado" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
};