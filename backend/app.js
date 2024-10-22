const express = require('express');
const app = express();

const dotenv = require('dotenv');
dotenv.config();

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.listen(process.env.PORT);

const userRouter =  require('./routes/users');

app.use('/users', userRouter);
