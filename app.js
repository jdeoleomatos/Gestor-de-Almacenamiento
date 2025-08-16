import express from 'express';
import cors from 'cors';
import productoRoutes from './Routes/productoRoutes.js';
import userRoutes from './Routes/usuariosRoutes.js';
import morgan from 'morgan';

const app= express();

app.use(cors());
console.log('CORS middleware applied');

app.use(express.json());

app.use(morgan('dev'));
console.log('Morgan middleware applied');

app.use(productoRoutes);
app.use(userRoutes);


export default app;