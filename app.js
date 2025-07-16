//import
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser')
const cors = require("cors");

const users = require('./src/api/routes/users.route')

const app = express();

//variable
const PORT = process.env.PORT || 3000

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    credentials: true,
    origin: [process.env.FRONT_END]
}));

app.use('/user', users);
app.get('/', (req, res) => {
    res.json({ messsage: 'fuck you'});
})

app.listen(PORT, () => {
    console.log("App running on",PORT);
})