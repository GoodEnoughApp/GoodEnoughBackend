const express = require('express');
const auth = require('../middlewares/jwtAuth');
const verify = require('../middlewares/validation');
const productsData = require('../data/products');
const router = express.Router();

// Upsert product using barcode
router.put('/', auth, async (req, res) => {
  try {
    const { barcode } = req.body;
    if (!verify.validString(barcode)) {
      res.status(422).json({
        status: 'error',
        message: 'Missing required values',
        code: 'ERROR_MISSING_REQUIRED_VALUES',
      });
      return;
    }
    const decoded = req.user;
    try {
      const addProduct = await productsData.addProduct(barcode, decoded.userId);
      if (addProduct.found) {
        if (addProduct.type === 'USER_PRODUCT') {
          res.status(200).json({ product: addProduct.product, status: 'success' });
        }
        // else if (addProduct.type === 'PRODUCT') {
        //   res.status(201).json({ product: addProduct.product, status: 'success' });
        // }
        else {
          res.status(201).json({ productId: addProduct.product.id, status: 'success' });
        }
      } else {
        res.status(201).json({ productId: null, status: 'success' });
      }
    } catch (error) {
      res.status(409).json({
        status: 'error',
        message: error.message,
        code: 'ERROR',
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      code: 'ERROR_SERVER',
    });
  }
});

// Get products based on category from user_product table
router.get('/', auth, async (req, res) => {
  try {
    if (
      req.query &&
      req.query.categoryId &&
      verify.checkIfValidUUID(req.query.categoryId) === false
    ) {
      res.status(422).json({
        status: 'error',
        message: 'Incorrect Category Id',
        code: 'ERROR_INVALID_VALUES',
      });
      return;
    }
    try {
      const { userId } = req.user;
      const allUserProducts = await productsData.getUserProducts(req.query.categoryId, userId);
      if (allUserProducts.productsFound) {
        res.status(200).json({
          products: allUserProducts.allUserProducts,
          status: 'success',
        });
        return;
      }
    } catch (error) {
      res.status(404).json({
        status: 'error',
        message: 'Product not found',
        code: 'ERROR_NOT_FOUND_PRODUCT',
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      code: 'ERROR_SERVER',
    });
  }
});

// Upsert a custom product
router.put('/custom', auth, async (req, res) => {
  try {
    let errorParams = [];
    const { barcode, name, alias, description, brand, manufacturer, categoryId } = req.body;
    if (barcode === undefined) {
      errorParams.push('barcode');
    }
    if (name === undefined) {
      errorParams.push('name');
    }
    if (brand === undefined) {
      errorParams.push('brand');
    }
    if (categoryId === undefined) {
      errorParams.push('categoryId');
    }
    if (errorParams.length > 0) {
      res.status(422).json({
        status: 'error',
        message: `${errorParams} are missing`,
        code: 'ERROR_MISSING_REQUIRED_VALUES',
      });
      return;
    }
    if (!verify.validString(barcode)) {
      errorParams.push('barcode');
    }
    if (!verify.validString(name)) {
      errorParams.push('name');
    }
    if (!verify.validString(brand)) {
      errorParams.push('brand');
    }
    if (!verify.checkIfValidUUID(categoryId)) {
      errorParams.push('categoryId');
    }
    if (errorParams.length > 0) {
      res.status(422).json({
        status: 'error',
        message: `${errorParams} are invalid`,
        code: 'ERROR_INVALID_VALUES',
      });
      return;
    }
    const decoded = req.user;
    const productExists = await productsData.findUserProductUsingBarcode(barcode, decoded.userId);
    if (productExists.found) {
      res.status(200).json({ product: productExists.userProduct, status: 'success' });
      return;
    }
    try {
      const addCustomProduct = await productsData.addCustomProduct(
        barcode,
        name,
        alias,
        description,
        brand,
        manufacturer,
        categoryId,
        decoded.userId
      );
      if (!addCustomProduct.isNew) {
        res.status(200).json({ product: addCustomProduct.customProduct, status: 'success' });
      } else {
        res.status(201).json({
          productId: addCustomProduct.customProduct.id,
          status: 'success',
        });
      }
    } catch (error) {
      res.status(409).json({
        status: 'error',
        message: error.message,
        code: 'ERROR',
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      code: 'ERROR_SERVER',
    });
  }
});

// Add an item to a product
router.post('/:productId', auth, async (req, res) => {
  try {
    const { expirationDate, quantity, cost } = req.body;
    if (
      !verify.checkIfValidUUID(req.params.productId) ||
      !verify.validString(expirationDate) ||
      !verify.checkIsProperNumber(quantity) ||
      !verify.checkIsProperNumber(cost) ||
      !verify.validIsoDate(expirationDate)
    ) {
      res.status(422).json({
        status: 'error',
        message: 'Missing required values',
        code: 'ERROR_MISSING_REQUIRED_VALUES',
      });
      return;
    }
    let expDate = new Date(Date.parse(expirationDate));
    let currentDate = new Date();
    if (expDate.getTime() < currentDate.getTime()) {
      res.status(409).json({
        status: 'error',
        message: 'Expiration date in the past',
        code: 'ERROR_PAST_EXPIRATION_DATE',
      });
      return;
    }
    const getProductDataById = await productsData.getUserProductById(req.params.productId);
    if (!getProductDataById.productsFound) {
      res.status(404).json({
        status: 'error',
        message: 'Product not found',
        code: 'ERROR_NOT_FOUND_PRODUCT',
      });
      return;
    }
    const decoded = req.user;
    if (decoded.userId !== getProductDataById.productById.user_id) {
      res.status(403).json({
        status: 'error',
        message: 'Not authorized to perform that action',
        code: 'ERROR_NOT_ALLOWED',
      });
      return;
    } else {
      try {
        const item = await productsData.addToItem(
          expirationDate,
          quantity,
          cost,
          getProductDataById.productById.id
        );
        if (item.itemAdded) {
          res.status(201).json({ item: item.addedItem, status: 'success' });
        }
      } catch (error) {
        res.status(409).json({
          status: 'error',
          message: error.message,
          code: 'ERROR',
        });
        return;
      }
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      code: 'ERROR_SERVER',
    });
  }
});

// Update a product
router.put('/:productId', auth, async (req, res) => {
  try {
    if (!verify.checkIfValidUUID(req.params.productId)) {
      res.status(400).json({
        status: 'error',
        message: 'Bad Request',
        code: 'BAD_REQUEST',
      });
      return;
    }
    const { barcode, name, alias, description, brand, manufacturer, categoryId } = req.body;
    if (
      !verify.validString(barcode) ||
      !verify.validString(name) ||
      !verify.validStringEmpty(alias) ||
      !verify.validStringEmpty(description) ||
      !verify.validStringEmpty(brand) ||
      !verify.validStringEmpty(manufacturer) ||
      !verify.checkIfValidUUID(categoryId)
    ) {
      res.status(422).json({
        status: 'error',
        message: 'Missing required values',
        code: 'ERROR_MISSING_REQUIRED_VALUES',
      });
      return;
    }
    const userId = req.user.userId;
    const updateProduct = await productsData.updateProduct(
      req.params.productId,
      userId,
      barcode,
      name,
      alias,
      description,
      brand,
      manufacturer,
      categoryId
    );
    if (updateProduct.barcodeExists) {
      res.status(409).json({
        status: 'error',
        message: 'Product exist',
        code: 'ERROR_BARCODE_UNIQUE',
      });
      return;
    }
    if (!updateProduct.categoryFound) {
      res.status(422).json({
        status: 'error',
        message: 'Wrong Category Id',
        code: 'ERROR_CATEGORY_NOT_EXIST',
      });
      return;
    }
    if (updateProduct.productUpdated) {
      res.status(200).json({ product: updateProduct.product, status: 'success' });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      code: 'ERROR_SERVER',
    });
  }
});

// Get a particular product using product_id from user_product table

router.get('/:productId', auth, async (req, res) => {
  try {
    if (!verify.checkIfValidUUID(req.params.productId)) {
      res.status(422).json({
        status: 'error',
        message: 'Incorrect Product Id',
        code: 'ERROR_INVALID_VALUES',
      });
      return;
    }
    const userId = req.user.userId;
    const productById = await productsData.getUserProductById(req.params.productId);
    if (productById.productsFound) {
      if (productById.productById.user_id !== userId) {
        res.status(403).json({
          status: 'error',
          message: 'Not authorized to perform that action',
          code: 'ERROR_NOT_ALLOWED',
        });
        return;
      }
      delete productById.productById['user_id'];
      res.status(200).json({
        product: productById.productById,
        status: 'success',
      });
      return;
    } else {
      res.status(404).json({
        status: 'error',
        message: 'Product not found',
        code: 'ERROR_NOT_FOUND_PRODUCT',
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      code: 'ERROR_SERVER',
    });
  }
});

// Delete from user product using product id
router.delete('/:productId', auth, async (req, res) => {
  try {
    if (!verify.checkIfValidUUID(req.params.productId)) {
      res.status(422).json({
        status: 'error',
        message: 'Incorrect Product Id',
        code: 'ERROR_INVALID_VALUES',
      });
      return;
    }
    const getProductDataById = await productsData.getUserProductById(req.params.productId);
    if (!getProductDataById.productsFound) {
      res.status(404).json({
        status: 'error',
        message: 'Product not found',
        code: 'ERROR_NOT_FOUND_PRODUCT',
      });
      return;
    }
    const decoded = req.user;
    if (decoded.userId !== getProductDataById.productById.user_id) {
      res.status(403).json({
        status: 'error',
        message: 'Not authorized to perform that action',
        code: 'ERROR_NOT_ALLOWED',
      });
      return;
    }
    try {
      const deletedProduct = await productsData.deleteProduct(req.params.productId);
      if (deletedProduct.delete) {
        res.status(200).json({
          status: 'success',
        });
        return;
      }
    } catch (error) {
      res.status(409).json({
        status: 'error',
        message: error.message,
        code: 'ERROR',
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      code: 'ERROR_SERVER',
    });
  }
});

module.exports = router;
