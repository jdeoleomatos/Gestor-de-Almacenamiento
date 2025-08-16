import { DataTypes } from "sequelize";
import { sequelize } from "../DB/db.js"; // <-- tu archivo de conexión

export const Producto = sequelize.define("Producto", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: "productos",
  timestamps: false,
});
