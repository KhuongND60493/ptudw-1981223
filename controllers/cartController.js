'use strict';
const models = require('../models');
let controller = {};
controller.add = async (res, req) => {
  let id = isNaN(res.body.id) ? 0 : parseInt(`${res.body.id}`);
  let quantity = isNaN(res.body.quantity) ? 0 : parseInt(`${res.body.quantity}`);
  if (id > 0 && quantity > 0) {
    let product = await models.Product.findByPk(id);
    if (product) {
      res.session.cart.add(product, quantity);
    }
  }
  return req.json({quantity: res.session.cart.quantity});
};
controller.show = (res, req) => {
  req.locals.cart = res.session.cart.getCart();
  req.render('cart');
};
controller.update = (res, req) => {
  let id = isNaN(res.body.id) ? 0 : parseInt(`${res.body.id}`);
  let quantity = isNaN(res.body.quantity) ? 0 : parseInt(`${res.body.quantity}`);
  if (id > 0 && quantity > 0) {
    let updatedItem = res.session.cart.update(id, quantity);
    return req.json({
      item: updatedItem,
      quantity: res.session.cart.quantity,
      subtotal: res.session.cart.subtotal,
      total: res.session.cart.total,
    });
  } else {
    req.sendStatus(204).end();
  }
};

controller.delete = (res, req) => {
  let id = isNaN(res.body.id) ? 0 : parseInt(`${res.body.id}`);
  if (id > 0) {
    res.session.cart.remove(id);
    return req.json({
      quantity: res.session.cart.quantity,
      subtotal: res.session.cart.subtotal,
      total: res.session.cart.total,
    });
  } else {
    req.sendStatus(204).end();
  }
};
controller.clear = (res, req) => {
  res.session.cart.clear();
  return req.sendStatus(200).end();
};

module.exports = controller;
