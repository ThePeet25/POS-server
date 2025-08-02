//import dependencies
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser')
const cors = require("cors");
const morgan = require('morgan');


//import file
const users = require('./src/api/routes/users.routes')
const products = require('./src/api/routes/products.routes')
const categories = require('./src/api/routes/category.routes')
const promotions = require('./src/api/routes/promotion.routes')
const promotionService = require('./src/servies/promotion.service')

const app = express();

//variable
const PORT = process.env.PORT || 3000

app.use(cors({
    credentials: true,
    origin: [process.env.FRONT_END]
}));

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev')); 

app.use('/user', users);
app.use('/product', products);
app.use('/category', categories);
app.use('/promotion', promotions);
app.get('/', (req, res) => {
    res.json({ messsage: 'fuck you'});
})

app.listen(PORT, () => {
    console.log("App running on",PORT);
})