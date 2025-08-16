import { Router } from "express";
import { Producto } from "../Models/productos.js";
import {
    crearProducto,
    getProductos,
    getProductoById,
    actualizarProducto,
    eliminarProducto            
} from "../Controllers/productosController.js";

const productoRoutes = Router();

productoRoutes.get("/getProductos", getProductos);
productoRoutes.get("/getProducto/:id", getProductoById);
productoRoutes.post("/crearProducto", crearProducto);
productoRoutes.put("/actualizarProducto/:id", actualizarProducto);
productoRoutes.delete("/eliminarProducto/:id", eliminarProducto);


export default productoRoutes;