const express = require('express');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/jwtAuth');
const productsData = require('../data/products');
const router = express.Router();

// Upsert product using barcode
router.put('/', auth, async (req, res) => {
  try {
    const { barcode } = req.body;
    if (!barcode) {
      res.status(422).json({
        status: 'error',
        message: 'Missing required values',
        code: 'ERROR_MISSING_REQUIRED_VALUES',
      });
    }
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const decoded = jwt.decode(token);
    const addProduct = await productsData.addProduct(barcode, decoded);
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
