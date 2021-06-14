const express = require("express");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const userRouter = require("./routes/userRoutes");

const app = express();

//Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use("/api", limiter);
//Body Parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

//Data Sanitization against NoSQL Query Injection
app.use(mongoSanitize());

//Data Sanitization against XSS
app.use(xss());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//ROUTES
app.use("/krayikapi/v1/users", userRouter);

module.exports = app;
