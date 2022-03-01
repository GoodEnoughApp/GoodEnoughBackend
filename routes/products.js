const express = require('express');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/jwtAuth');
const productsData = require('../data/products');
const router = express.Router();

router.put('/', auth, async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const decoded = jwt.decode(token);
    const { barcode } = req.body;
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
    res.status(500).json({ error: error });
  }
});

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
