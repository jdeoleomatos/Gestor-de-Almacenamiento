import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import { sequelize } from "./DB/db.js";

const PORT = process.env.PORT || 3000;
async function main() {

  try {
  await sequelize.sync({ force: false });
  await sequelize.authenticate();
  console.log('se conectó a la base de datos');

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

main();