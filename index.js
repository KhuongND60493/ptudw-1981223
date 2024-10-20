'use strict';
require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 5001;
const expressHandlebars = require('express-handlebars');
const redisStore = require('connect-redis').default;
const { createClient } = require('redis');
const session = require('express-session');
const { createPagination } = require('express-handlebars-paginate');
const { createStarList, createActive } = require('./controllers/handlebarHelper');

const redisClient = createClient({
  url: process.env.REDIS_URL
})
redisClient.connect().catch(console.error);


app.use(express.static(__dirname + '/public'));

const hbs = expressHandlebars.create({
  partialsDir: 'views/partials/',
  layoutDir: 'views/layouts',
  defaultLayout: 'layout',
  extname: 'hbs',
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
  },
  helpers: { createStarList, createActive, createPagination },
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: new redisStore({ client: redisClient }),
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 20 * 60 * 1000 },
  }),
);
app.use((req, res, next) => {
  const Cart = require('./controllers/cart');
  req.session.cart = new Cart(req.session.cart ? req.session.cart : {});
  res.locals.quantity = req.session.cart.quantity;
  next();
});
app.use('/', require('./routes/rootRouter'));
app.use('/products', require('./routes/productsRouter'));
app.use('/users', require('./routes/usersRouter'));
app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found!' });
});
app.use((error, req, res) => {
  console.error(error);
  res.status(500).render('error', { message: 'Internal Server Error!' });
});
app.listen(port, () => {
  console.log(`server start at port: ${port}`);
});
