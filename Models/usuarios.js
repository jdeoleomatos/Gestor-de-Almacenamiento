import { DataTypes } from "sequelize";
import { sequelize } from "../DB/db.js";

export const Usuario = sequelize.define("Usuario", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  apellido: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [6, 100],
    },
  },
  rol: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isIn: [[0, 1, 2]], // 0 = eliminado, 1 = admin, 2 = user
    },
  },
}, {
  tableName: "usuarios",
  timestamps: false,
  defaultScope: {
    attributes: { exclude: ["password"] }
  },
  scopes: {
  withPassword: {
    attributes: { include: ['password'] }
  }
}
});
