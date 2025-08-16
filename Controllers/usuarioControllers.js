import bcrypt from "bcrypt";
import { Usuario } from "../Models/usuarios.js"; 

// GET /usuarios
export const getUsers = async (req, res) => {
  try {

    const usuarios = await Usuario.findAll();
    res.json(usuarios);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

// GET /usuarios/:id
export const getUserById = async (req, res) => {
  try {

    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(usuario);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
};

// POST /usuarios
export const crearUser = async (req, res) => {
  try {
    const datos = req.body;
    datos.rol = 2; // Asignar rol de usuario por defecto

    if (!datos.nombre || !datos.apellido || !datos.email || !datos.password) {
      return res.status(400).json({ error: "Nombre, apellido, email y password son obligatorios" });
    }

    // 🔑 Encriptar contraseña antes de guardar
    const salt = await bcrypt.genSalt(10); 
    const hashedPassword = await bcrypt.hash(datos.password, salt);
    datos.password = hashedPassword;

    const newUser = await Usuario.create(datos);

    
    const userData = newUser.toJSON();
    delete userData.password;

    res.status(201).json(userData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear usuario" });
  }
};

// PUT /usuarios/:id
export const actualizarUser = async (req, res) => {
  try {

    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
    await usuario.update(req.body);
    res.json(usuario);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
};

// DELETE /usuarios/:id
export const eliminarUser = async (req, res) => {
  try {

    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
    await usuario.destroy();
    res.json({ message: "Usuario eliminado" });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y password son obligatorios" });
    }


    const usuario = await Usuario.scope('withPassword').findOne({ where: { email } });
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    // Validar que la contraseña exista
    if (!usuario.password) {
      return res.status(500).json({ error: "Este usuario no tiene contraseña registrada" });
    }

    // Comparar con bcrypt
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) return res.status(401).json({ error: "Contraseña incorrecta" });

    const { password: _, ...userData } = usuario.toJSON();
    res.json({ message: "Login exitoso", user: userData });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en el login" });
  }
};