import 'express-async-errors';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Joi from 'joi';
import logger from './startup/logger';
import { errorHandler } from './middlewares/index';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import {
  rolesRouter,
  typesRouter,
  usersRouter,
  documentsRouter,
  searchDocument
} from './routes/index';
dotenv.config();

const app = express();

//API documentation using Swagger
const options = {
  swaggerDefinition: {
    info: {
      title: 'Document Management System',
      version: '1.0.0',
      description: 'API documentation using swagger'
    },
  },
  // List of files to be processes. You can also set globs './routes/*.js'
  apis: ['./routes/*.js']
};

const specs = swaggerJsdoc(options);

//environment variable
let db = process.env.REMOTE_DATABASE;
let jwtPrivateKey = process.env.JWT_PRIVATE_KEY;

if (process.env.NODE_ENV === 'test') db = process.env.TEST_DATABASE;

//middlewares
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(express.json());
app.use('/api/v1/roles', rolesRouter);
app.use('/api/v1/types', typesRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/documents', documentsRouter);
app.use('/api/v1/search', searchDocument);
app.use(errorHandler);

Joi.objectId = require('joi-objectid')(Joi);



//database connection
mongoose.connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true
  })
  .then(() => logger.info(`Connected to ${db}...`))
  .catch((e) =>{logger.info(e.message)});

if (!jwtPrivateKey) {
  throw new Error('FATAL ERROR: jwtPrivateKey is not defined.');
}

//app PORT
const port = process.env.PORT;

//app listens on the specified PORT
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => logger.info(`Listening on port ${port}...`));
}

export default app;
