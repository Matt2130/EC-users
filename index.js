import 'dotenv/config';
import app from './src/app.js';

/* const PORT = process.env.PORT_EXPRESS;
 */
const PORT = process.env.DB_PORT;

app.listen(PORT, () => {
    console.log(`Servicio en el puerto ${PORT}`)
});