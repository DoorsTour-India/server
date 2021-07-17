const express = require('express');
const rateLimit = require('express-rate-limit');
const path = require('path');
const cors = require('cors');

const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const viewRouter = require('./routes/viewRoutes');
const productRouter = require('./routes/productRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

//Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);
//Body Parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

//Data Sanitization against NoSQL Query Injection
app.use(mongoSanitize());

//Data Sanitization against XSS
app.use(xss());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//ROUTES
app.use('/', viewRouter);
app.use('/krayikapi/v1/users', userRouter);
app.use('/krayikapi/v1/product' , productRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
