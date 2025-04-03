import 'dotenv/config';
import app from './src/app.js';

const PORT = process.env.PORT_EXPRESS;

app.listen(PORT, () => {
    console.log(`Servicio en el puerto ${PORT}`)
});