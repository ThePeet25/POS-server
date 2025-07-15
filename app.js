//import
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser')

const users = require('./src/api/routes/users.route')

const app = express();

//variable
const PORT = process.env.PORT || 3000

app.use(express.json());
app.use(cookieParser());

app.use('/user', users);

app.listen(PORT, () => {
    console.log("App running on",PORT);
})