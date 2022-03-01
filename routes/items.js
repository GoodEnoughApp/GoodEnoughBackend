const express = require('express');
const auth = require('../middlewares/jwtAuth');
const itemsData = require('../data/items');
const router = express.Router();

/**
router.put('/', auth, async (req, res) => {
  try {
    const { barcode } = req.body;
    const addProduct = await productsData.addProduct(barcode);
    if (addProduct.found) {
      res.status(200).json({ product: addProduct.product });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
});
*/

router.get('/', auth, async (req, res) => {
  try {
    if (req.query && req.query.used === 'true') {
      req.query.used = true;
    } else {
      req.query.used = false;
    }
    const allItems = await itemsData.getItems(
      req.query.productId,
      req.query.used
    );
    if (allItems.itemsFound) {
      res.status(200).json({
        items: allItems.allItems,
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

router.get('/:itemId', auth, async (req, res) => {
  try {
    const itemById = await itemsData.getItemById(req.params.itemId);
    if (itemById.itemsFound) {
      res.status(200).json({
        item: itemById.itemById,
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
