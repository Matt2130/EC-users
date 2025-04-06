import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();
 
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST, // DIRECCIÓN
        port: process.env.DB_PORT, // PUERTO
        dialect: 'mysql' 
    }
);

sequelize.authenticate()
    .then( () => console.log('Conexión con éxito'))
    .catch(err => console.error('No se pudo conectar con la BD: ', err));

export default sequelize;