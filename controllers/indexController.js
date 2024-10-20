'use strict';
const models = require('../models');
const constroller = {};

constroller.showHomepage = async (req, res) => {
  const categories = await models.Category.findAll();
  const recentProducts = await models.Product.findAll({
    attributes: ['id', 'name', 'imagePath', 'stars', 'price', 'oldPrice', 'createdAt'],
    order: [['createdAt', 'DESC']],
    limit: 10,
  });

  const featureProducts = await models.Product.findAll({
    attributes: ['id', 'name', 'imagePath', 'stars', 'price', 'oldPrice'],
    order: [['stars', 'DESC']],
    limit: 10,
  });
  res.locals.featureProducts = featureProducts;
  res.locals.recentProducts = recentProducts;
  const secondArray = categories.splice(2, 2);
  const thirdArray = categories.splice(1, 1);
  res.locals.categoryArray = [categories, secondArray, thirdArray];
  const brands = await models.Brand.findAll();
  res.render('index', {brands});
};
constroller.showPage = (req, res, next) => {
  const pages = ['cart', 'checkout', 'contact', 'login', 'my-account', 'product-detail', 'product-list', 'wishlist'];
  if (pages.includes(req.params.page)) res.render(req.params.page);
  next();
};
module.exports = constroller;
