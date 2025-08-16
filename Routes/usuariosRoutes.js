import { Router } from "express";
import {
    crearUser,
    getUsers,
    getUserById,
    actualizarUser,
    eliminarUser,
    loginUser     
} from "../Controllers/usuarioControllers.js";


const userRoutes = Router();

userRoutes.get("/getUsers", getUsers);
userRoutes.get("/getUsers/:id", getUserById);
userRoutes.post("/crearUser", crearUser);
userRoutes.put("/actualizarUser/:id", actualizarUser);
userRoutes.delete("/eliminarUser/:id", eliminarUser);
userRoutes.post("/userLogin", loginUser); 


export default userRoutes;