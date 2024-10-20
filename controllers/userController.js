'use strict';
const models = require('../models');
const Op = require('sequelize').Op;

let controller = {};
controller.showCheckout = async (req, res) => {
  let userId = 1;
  if (req.session.cart.quantity > 0) {
    let addresses = await models.Address.findAll({
      where: {userId},
    });
    res.locals.addresses = addresses;
    res.locals.cart = req.session.cart.getCart();
    res.render('checkout');
  } else {
    res.redirect('/products');
  }
};
controller.placeorders = async (req, res) => {
  let userId = 1;
  let {
    payment = 'COD',
    firstName = '',
    lastName = '',
    email = '',
    mobile = '',
    address = '',
    country = '',
    city = '',
    state = '',
    zipCode = '',
    isDefault = false,
  } = req.body;
  let addressId = isNaN(req.body.addressId) ? 0 : parseInt(`${req.body.addressId}`);
  let foundAddress = await models.Address.findByPk(addressId);
  if (!foundAddress) {
    foundAddress = await models.Address.create({
      firstName,
      lastName,
      email,
      mobile,
      address,
      country,
      city,
      state,
      zipCode,
      isDefault,
    });
  }
  let cart = req.session.cart;
  cart.paymentMethod = payment;
  cart.shippingAddress = `${foundAddress.firstName} ${foundAddress.lastName}, Email: ${foundAddress.email}, Mobile: ${foundAddress.mobile}, Address: ${foundAddress.address}, ${foundAddress.city}, ${foundAddress.country}, ${foundAddress.state}, ${foundAddress.zipCode}`;
  switch (payment) {
    case 'PAYPAL':
      await saveOrders(req, res, 'PAID');
      break;
    case 'COD':
      await saveOrders(req, res, 'UNPAID');
      break;
  }
  // res.redirect('/users/checkout');
};

async function saveOrders(req, res, status) {
  let userId = 1;
  let {items, ...rest} = req.session.cart.getCart();
  let order = await models.Order.create({
    userId,
    status,
    ...rest,
  });
  let orderDetails = [];
  items.forEach(x => {
    orderDetails.push({
      quantity: x.quantity,
      price: x.price,
      orderId: order.id,
      total: x.total,
      productId: x.product.id,
    });
  });
  await models.OrderDetail.bulkCreate(orderDetails);
  req.session.cart.clear();
  res.render('error', {message: 'Thank you for your order!'});
}

module.exports = controller;
