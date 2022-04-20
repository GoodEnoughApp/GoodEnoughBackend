const axios = require('axios');
const models = require('../models/index');
const categoryData = require('./category');
require('dotenv').config();
require('pg').defaults.parseInt8 = true;

const baseURL = 'https://api.upcdatabase.org/product';
const baseURLItemDb = 'https://api.upcitemdb.com/prod/trial/lookup?upc=';

/**
 * This method is used to find product in user_product table using barcode as a param
 */
const findUserProductUsingBarcode = async (barcode, userId) => {
  const userProduct = await models.user_product.findOne({
    where: {
      barcode,
      user_id: userId,
    },
  });
  if (userProduct !== null) {
    return { found: true, userProduct: userProduct.dataValues };
  }

  return { found: false };
};

/**
 * This method is used to find product in product table using barcode as a param
 */
const findProductUsingBarcode = async (barcode) => {
  const product = await models.product.findOne({
    where: {
      barcode,
    },
  });
  if (product !== null) {
    return { found: true, product: product.dataValues };
  }

  return { found: false };
};

/**
 * This method is used to find product in UPC database using barcode as a param
 */
const findUpcProductUsingBarcode = async (barcode) => {
  const url = `${baseURL}/${barcode}?apikey=${process.env.UPC_API_KEY}`;
  const upcProduct = await axios.get(url);
  if (upcProduct.data.success === true) {
    return { found: true, upcProduct: upcProduct.data };
  }
  return { found: false };
};

/**
 * This method is used to find product in UPC database using barcode as a param
 */
const findUpcItemDbProductUsingBarcode = async (barcode) => {
  let upcProduct;
  const url = `${baseURLItemDb}${barcode}`;
  try {
    upcProduct = await axios.get(url);
  } catch (error) {
    return { found: false };
  }
  return { found: true, upcProduct: upcProduct.data.items[0] };
};

const createUserProductFromProduct = async (userId, barcode, product) => {
  try {
    const addedProduct = await models.user_product.findOrCreate({
      where: {
        user_id: userId,
        category_id: product.category_id,
        barcode,
        barcode_type: product.barcode_type,
        name: product.name,
        alias: product.alias !== undefined ? product.alias : '',
        description: product.description !== undefined ? product.description : '',
        brand: product.brand !== undefined ? product.brand : '',
        manufacturer: product.manufacturer !== undefined ? product.manufacturer : '',
      },
    });
    return addedProduct[0].dataValues;
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * This method is used to insert record from UPC databse to user_product table
 */
const createUserProductUsingUPC = async (barcode, upcProduct, userId, categoryId) => {
  try {
    const addedProduct = await models.user_product.findOrCreate({
      where: {
        user_id: userId,
        category_id: categoryId,
        barcode,
        barcode_type: 'UPC',
        name: upcProduct.title,
        alias: upcProduct.alias !== undefined ? upcProduct.alias : '',
        description: upcProduct.description !== undefined ? upcProduct.description : '',
        brand: upcProduct.brand !== undefined ? upcProduct.brand : '',
        manufacturer: upcProduct.manufacturer !== undefined ? upcProduct.manufacturer : '',
      },
    });
    return addedProduct[0].dataValues;
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * This method is used to insert record form UPC database into the product table
 */
const createProductUsingUPC = async (barcode, upcProduct, userId, categoryId) => {
  try {
    await models.product.findOrCreate({
      where: {
        barcode,
        barcode_type: 'UPC',
        name: upcProduct.title,
        category_id: categoryId,
      },
    });
    const addedUserProduct = createUserProductUsingUPC(barcode, upcProduct, userId, categoryId);
    return addedUserProduct;
  } catch (error) {
    throw Error(error.message);
  }
};

/**
 * This method is used to do an upsert using barcode
 * The method first checks for prodcut in user_product table
 * Found in user_product table ? return prodcut details(200) : check in product table
 * Found in product table ? create in the user_product table(201) : check in UPC database
 * Found in UPC database ? insert category(if new) and insert result in product and user_product table and return record from user_product(201) : return product_id as null(201)
 */
const addProduct = async (barcode, userId) => {
  const userProduct = await findUserProductUsingBarcode(barcode, userId);
  if (userProduct.found) {
    const tempCategoryId = userProduct.userProduct.category_id;
    const categoryById = await categoryData.getCategoryById(tempCategoryId);
    userProduct.userProduct.category = {
      id: categoryById.categoryById.id,
      name: categoryById.categoryById.name,
    };
    userProduct.userProduct.barcodeType = userProduct.userProduct.barcode_type;
    userProduct.userProduct.type = 'barcode';
    delete userProduct.userProduct.category_id;
    delete userProduct.userProduct.user_id;
    delete userProduct.userProduct.barcode_type;
    return {
      type: 'USER_PRODUCT',
      product: userProduct.userProduct,
      found: true,
    };
  }
  const product = await findProductUsingBarcode(barcode);
  if (product.found) {
    const userProductCreated = await createUserProductFromProduct(userId, barcode, product.product);
    const tempCategoryId = userProductCreated.category_id;
    const categoryById = await categoryData.getCategoryById(tempCategoryId);
    userProductCreated.category = {
      id: categoryById.categoryById.id,
      name: categoryById.categoryById.name,
    };
    userProductCreated.type = 'barcode';
    userProductCreated.barcodeType = userProductCreated.barcode_type;
    delete userProductCreated.category_id;
    delete userProductCreated.user_id;
    delete userProductCreated.barcode_type;
    return {
      type: 'PRODUCT',
      product: userProductCreated,
      found: true,
    };
  }
  let upcProduct = await findUpcProductUsingBarcode(barcode);
  if (!upcProduct.found) {
    upcProduct = await findUpcItemDbProductUsingBarcode(barcode);
  }
  if (upcProduct.found) {
    const category = await categoryData.useCategory(upcProduct.upcProduct.category.toLowerCase());
    if (upcProduct.upcProduct.title !== undefined && upcProduct.upcProduct.title.trim() === '') {
      if (
        upcProduct.upcProduct.description !== undefined &&
        upcProduct.upcProduct.description.trim() === ''
      ) {
        upcProduct.upcProduct.title = 'GoodEnough Item';
      } else {
        upcProduct.upcProduct.title = upcProduct.upcProduct.description.trim();
      }
    }
    const createdProduct = await createProductUsingUPC(
      barcode,
      upcProduct.upcProduct,
      userId,
      category.dataValues.id
    );
    return {
      type: 'UPC_PRODUCT',
      product: createdProduct,
      found: true,
    };
  }
  return { found: false };
};

/**
 * This method is used to find product(s) in user_product table using categoryId as a param
 */
const getUserProducts = async (userId, categoryId = '') => {
  const where = {};
  if (categoryId.trim() !== '') {
    where.category_id = categoryId;
  }
  where.user_id = userId;
  const allUserProducts = await models.user_product.findAll({
    where,
  });
  if (allUserProducts === null) {
    return { productsFound: false };
  }
  for (let index = 0; index < allUserProducts.length; index += 1) {
    const tempCategoryId = allUserProducts[index].category_id;
    // Sid code - Issue araised here when I ran the code
    // eslint-disable-next-line no-await-in-loop
    const categoryById = await categoryData.getCategoryById(tempCategoryId);
    allUserProducts[index].dataValues.category = {
      id: categoryById.categoryById.id,
      name: categoryById.categoryById.name,
      type: categoryById.categoryById.category_type
    };
    allUserProducts[index].dataValues.type = 'barcode';
    allUserProducts[index].dataValues.barcodeType = allUserProducts[index].dataValues.barcode_type;
    delete allUserProducts[index].dataValues.category_id;
    delete allUserProducts[index].dataValues.user_id;
    delete allUserProducts[index].dataValues.barcode_type;
  }
  return { productsFound: true, allUserProducts };
};

/**
 * This method is used to find product in user_product table using product_id as a param
 */
const getUserProductById = async (id) => {
  if (!id) {
    throw new Error('Invalid or missing requirements');
  }
  const productById = await models.user_product.findOne({
    where: {
      id,
    },
  });
  if (productById === null) {
    return { productsFound: false };
  }
  const tempCategoryId = productById.dataValues.category_id;
  const categoryById = await categoryData.getCategoryById(tempCategoryId);
  productById.dataValues.category = {
    id: categoryById.categoryById.id,
    name: categoryById.categoryById.name,
  };
  productById.dataValues.userId = productById.dataValues.user_id;
  productById.dataValues.barcodeType = productById.dataValues.barcode_type;
  productById.dataValues.type = 'barcode';
  delete productById.dataValues.category_id;
  delete productById.dataValues.user_id;
  delete productById.dataValues.barcode_type;
  return { productsFound: true, productById: productById.dataValues };
};

/**
 * This method is used to add a custom product where user provides all the details manually
 * This method/endpoint will be invoked incase /products: put request gives null result
 */
const addCustomProduct = async (
  barcode,
  name,
  alias,
  description,
  brand,
  manufacturer,
  categoryId,
  userId
) => {
  try {
    await models.product.findOrCreate({
      where: {
        barcode,
        barcode_type: 'EAN',
        name,
        category_id: categoryId,
      },
    });
    const addedUserProduct = await models.user_product.findOrCreate({
      where: {
        user_id: userId,
        category_id: categoryId,
        barcode,
        barcode_type: 'EAN',
        name,
        alias,
        description,
        brand,
        manufacturer,
      },
    });
    const tempCategoryId = addedUserProduct[0].dataValues.category_id;
    const categoryById = await categoryData.getCategoryById(tempCategoryId);
    addedUserProduct[0].dataValues.category = {
      id: categoryById.categoryById.id,
      name: categoryById.categoryById.name,
    };
    addedUserProduct[0].dataValues.barcodeType = addedUserProduct[0].dataValues.barcode_type;
    delete addedUserProduct[0].dataValues.category_id;
    delete addedUserProduct[0].dataValues.user_id;
    delete addedUserProduct[0].dataValues.barcode_type;
    return {
      customProduct: addedUserProduct[0].dataValues,
      // eslint-disable-next-line
      isNew: addedUserProduct[0]._options.isNewRecord,
    };
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Method to add item in Item table referencing a user product
 */
const addToItem = async (expirationDate, quantity, cost, productId) => {
  const currentDate = new Date().toISOString();
  const addedItem = await models.item.create({
    product_id: productId,
    expiration_date: expirationDate,
    created_at: currentDate,
    quantity: Number(quantity),
    initial_quantity: 0,
    cost: parseFloat(cost),
    is_used: false,
    is_expired: false,
  });
  if (addedItem === null) {
    return { itemAdded: false };
  }
  return { itemAdded: true, addedItem: addedItem.dataValues };
};

const deleteProduct = async (productId) => {
  const deletedProduct = await models.user_product.destroy({
    where: {
      id: productId,
    },
  });
  if (deletedProduct === 1) {
    return { delete: true };
  }
  return { delete: false };
};

const updateProduct = async (
  productId,
  userId,
  barcode,
  name,
  alias,
  description,
  brand,
  manufacturer,
  categoryId
) => {
  const product = await findUserProductUsingBarcode(barcode, userId);
  if (product.found && product.userProduct.id !== productId) {
    return { barcodeExists: true };
  }
  const categoryCheck = await categoryData.getCategoryById(categoryId);
  if (!categoryCheck.categoryFound) {
    return { categoryFound: false };
  }

  try {
    await models.user_product.update(
      {
        barcode,
        name,
        alias,
        description,
        brand,
        manufacturer,
        category_id: categoryId,
      },
      {
        where: {
          id: productId,
          user_id: userId,
        },
      }
    );
    const productById = await getUserProductById(productId);
    delete productById.productById.userId;
    return { productUpdated: true, product: productById.productById };
  } catch (error) {
    throw Error(error.message);
  }
};

module.exports = {
  addProduct,
  getUserProducts,
  getUserProductById,
  addCustomProduct,
  findUserProductUsingBarcode,
  addToItem,
  deleteProduct,
  updateProduct,
};
