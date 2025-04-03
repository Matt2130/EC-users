import express from 'express';
import bodyParser from 'body-parser';
import usersRoutes from './routes/usersRoutes.js';
import swaggerSpec from './api-docs.js';
import swaggerUI from 'swagger-ui-express';

const app = express();

app.use(bodyParser.json());

app.use('/api/users', usersRoutes);
app.use('/api-docs', swaggerUI.serve,
    swaggerUI.setup(swaggerSpec));
      
export default app;