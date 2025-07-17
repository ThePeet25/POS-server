//import dependencies
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser')
const cors = require("cors");
const morgan = require('morgan');

//import file
const users = require('./src/api/routes/users.route')
const products = require('./src/api/routes/products.route')
const categories = require('./src/api/routes/category.routes')

const app = express();

//variable
const PORT = process.env.PORT || 3000

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev')); 

app.use(cors({
    credentials: true,
    origin: [process.env.FRONT_END]
}));

app.use('/user', users);
app.use('/product', products);
app.use('/category', categories);
app.get('/', (req, res) => {
    res.json({ messsage: 'fuck you'});
})

app.listen(PORT, () => {
    console.log("App running on",PORT);
})