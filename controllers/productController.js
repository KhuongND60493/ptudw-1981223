const sequelize = require('sequelize');
const models = require('../models');
const Op = sequelize.Op;
let controller = {};

controller.getData = async (req, res, next) => {
  let categories = await models.Category.findAll({include: [{model: models.Product}]});
  let brands = await models.Brand.findAll({include: [{model: models.Product}]});
  let tags = await models.Tag.findAll();
  res.locals.tags = tags;
  res.locals.categories = categories;
  res.locals.brands = brands;
  next();
};
controller.show = async (req, res) => {
  let categoryId = isNaN(req.query.category) ? 0 : parseInt(`${req.query.category}`);
  let brandId = isNaN(req.query.brand) ? 0 : parseInt(`${req.query.brand}`);
  let tagId = isNaN(req.query.tag) ? 0 : parseInt(`${req.query.tag}`);
  let keyword = req.query?.keyword || '';
  let sort = ['price', 'newest', 'popular'].includes(req.query?.sort) ? req.query.sort : 'price';
  let page = isNaN(req.query.page) ? 1 : Math.max(parseInt(`${req.query.page}`), 1);
  let limit = 6;
  let options = {
    attributes: ['id', 'name', 'imagePath', 'stars', 'price', 'oldPrice', 'brandId', 'categoryId'],
    where: {},
  };
  if (categoryId > 0) {
    options.where.categoryId = categoryId;
  }
  if (brandId > 0) {
    options.where.brandId = brandId;
  }
  if (tagId > 0) {
    options.include = [{model: models.Tag, where: {id: tagId}}];
  }
  if (keyword.trim() != '') {
    options.where.name = {
      [Op.iLike]: `%${keyword}%`,
    };
  }
  switch (sort) {
    case 'newest':
      options.order = [['createdAt', 'DESC']];
      break;
    case 'popular':
      options.order = [['stars', 'DESC']];
      break;
    default:
      options.order = [['price', 'ASC']];
      break;
  }
  options.limit = limit;
  options.offset = limit * (page - 1);

  let {rows, count} = await models.Product.findAndCountAll(options);
  res.locals.sort = sort;
  res.locals.products = rows;
  res.locals.pagination = {page: page, limit: limit, totalRows: count, queryParams: req.query};
  res.locals.originalUrl = removeParam('sort', req.originalUrl);
  if (Object.keys(req.query).length == 0) {
    res.locals.originalUrl = `${res.locals.originalUrl}?`;
  }

  res.render('product-list');
};
controller.showDetail = async (req, res) => {
  let id = isNaN(req.params.id) ? 0 : parseInt(`${req.params.id}`);
  if (id > 0) {
    const product = await models.Product.findOne({
      attributes: ['id', 'name', 'stars', 'price', 'oldPrice', 'summary', 'description', 'specification'],
      where: {id},
      include: [
        {model: models.Image, attributes: ['imagePath', 'name']},
        {
          model: models.Review,
          attributes: ['review', 'stars', 'createdAt'],
          include: [{model: models.User, attributes: ['firstName', 'lastName']}],
        },
        {
          model: models.Tag,
          attributes: ['id'],
        },
      ],
    });

    const tagIds = [];
    product.Tags.forEach(x => {
      tagIds.push(x.id);
    });
    const relatedProducts = await models.Product.findAll({
      attributes: ['id', 'name', 'imagePath', 'stars', 'price', 'oldPrice', 'summary', 'description', 'specification'],
      include: [{model: models.Tag, attributes: ['id'], where: {id: {[Op.in]: tagIds}}}],
      limit: 10,
    });

    res.locals.relatedProducts = relatedProducts;
    res.locals.product = product;
    res.render('product-detail');
  }
};
module.exports = controller;

function removeParam(key, sourceURL) {
  var rtn = sourceURL.split('?')[0],
    param,
    params_arr = [],
    queryString = sourceURL.indexOf('?') !== -1 ? sourceURL.split('?')[1] : '';
  if (queryString !== '') {
    params_arr = queryString.split('&');
    for (var i = params_arr.length - 1; i >= 0; i -= 1) {
      param = params_arr[i].split('=')[0];
      if (param === key) {
        params_arr.splice(i, 1);
      }
    }
    if (params_arr.length) rtn = rtn + '?' + params_arr.join('&');
  }
  return rtn;
}
