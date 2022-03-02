const express = require('express');
const auth = require('../middlewares/jwtAuth');
const productsData = require('../data/products');
const router = express.Router();

// Upsert product using barcode
router.put('/', auth, async (req, res) => {
  try {
    const { barcode } = req.body;
    if (barcode === undefined || barcode.trim() === '') {
      res.status(422).json({
        status: 'error',
        message: 'Missing required values',
        code: 'ERROR_MISSING_REQUIRED_VALUES',
      });
    }
    const decoded = req.user;
    const addProduct = await productsData.addProduct(barcode, decoded.userId);
    if (addProduct.found) {
      if (addProduct.type === 'USER_PRODUCT') {
        res
          .status(200)
          .json({ product: addProduct.product, status: 'success' });
      } else {
        res
          .status(201)
          .json({ productId: addProduct.product.id, status: 'success' });
      }
    } else {
      res.status(201).json({ productId: null, status: 'success' });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      code: 'ERROR_SERVER',
    });
  }
});

// Get products based on category from user_product table
router.get('/', auth, async (req, res) => {
  try {
    const allUserProducts = await productsData.getUserProducts(
      req.query.categoryId
    );
    if (allUserProducts.productsFound) {
      res.status(200).json({
        products: allUserProducts.allUserProducts,
        status: 'success',
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      code: 'ERROR_SERVER',
    });
  }
});

// Upsert a custom product
router.put('/custom', auth, async (req, res) => {
  try {
    const {
      barcode,
      name,
      alias,
      description,
      brand,
      manufacturer,
      categoryId,
    } = req.body;
    if (
      barcode === undefined ||
      name === undefined ||
      brand === undefined ||
      categoryId === undefined ||
      barcode.trim() === '' ||
      name.trim() === '' ||
      brand.trim() === '' ||
      categoryId.trim() === ''
    ) {
      res.status(422).json({
        status: 'error',
        message: 'Missing required values',
        code: 'ERROR_MISSING_REQUIRED_VALUES',
      });
    }
    const decoded = req.user;
    // const productExists = await productsData.findUserProductUsingBarcode(
    //   barcode
    // );
    // if (productExists.found) {
    //   res.status(409).json({
    //     status: 'error',
    //     message: 'Product exist',
    //     code: 'ERROR_BARCODE_UNIQUE',
    //   });
    //   return;
    // }
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
      res
        .status(200)
        .json({ product: addCustomProduct.customProduct, status: 'success' });
    } else {
      res.status(201).json({
        productId: addCustomProduct.customProduct.id,
        status: 'success',
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      code: 'ERROR_SERVER',
    });
  }
});

// Add an item to a product
router.post('/:productId', auth, async (req, res) => {
  const { expirationDate, quantity, cost } = req.body;
  if (
    expirationDate === undefined ||
    quantity === undefined ||
    cost === undefined
  ) {
    res.status(422).json({
      status: 'error',
      message: 'Missing required values',
      code: 'ERROR_MISSING_REQUIRED_VALUES',
    });
    return;
  }
  const getProductDataById = await productsData.getUserProductById(
    req.params.productId
  );
  if (!getProductDataById.productsFound) {
    res.status(404).json({
      status: 'error',
      message: 'Product not found',
      code: 'ERROR_NOT_FOUND_PRODUCT',
    });
  } else {
    const decoded = req.user;
    if (decoded.userId !== getProductDataById.productById.user_id) {
      res.status(403).json({
        status: 'error',
        message: 'Not authorized to perform that action',
        code: 'ERROR_NOT_ALLOWED',
      });
    } else {
    }
  }
});

// Get a particular product using product_id from user_product table
router.get('/:productId', auth, async (req, res) => {
  try {
    const productById = await productsData.getUserProductById(
      req.params.productId
    );
    if (productById.productsFound) {
      res.status(200).json({
        product: productById.productById,
        status: 'success',
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      code: 'ERROR_SERVER',
    });
  }
});

module.exports = router;
