const express = require('express');
const auth = require('../middlewares/jwtAuth');
const itemsData = require('../data/items');
const productsData = require('../data/products');
const router = express.Router();

// To get item from item table based on product_id and used condition
router.get('/', auth, async (req, res) => {
  try {
    let productId = '';
    let used = false;
    if (req.query && req.query.used && req.query.used.trim() === 'true') {
      used = true;
    }
    if (req.query && req.query.productId && req.query.productId.trim() != '') {
      productId = req.query.productId;
    }
    const allItems = await itemsData.getItems(productId, used);
    if (allItems.itemsFound) {
      res.status(200).json({
        items: allItems.allItems,
        status: 'success',
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      code: 'ERROR_SERVER',
    });
  }
});

// To update an item in Item table
router.put('/:itemId', auth, async (req, res) => {
  try {
    const { expirationDate, initialQuantity, quantity, cost, isUsed } = req.body;
    if (
      expirationDate === undefined ||
      initialQuantity === undefined ||
      quantity === undefined ||
      cost === undefined ||
      isUsed === undefined ||
      expirationDate.trim() === ''
    ) {
      res.status(422).json({
        status: 'error',
        message: 'Missing required values',
        code: 'ERROR_MISSING_REQUIRED_VALUES',
      });
      return;
    }
    const itemById = await itemsData.getItemById(req.params.itemId);
    if (!itemById.itemsFound) {
      res.status(404).json({
        status: 'error',
        message: 'Item not found',
        code: 'ERROR_NOT_FOUND_ITEM',
      });
      return;
    }
    const userId = req.user.userId;
    const productById = await productsData.getUserProductById(itemById.itemById.product_id);
    if (productById.productsFound) {
      if (userId !== productById.productById.user_id) {
        res.status(403).json({
          status: 'error',
          message: 'Not authorized to perform that action',
          code: 'ERROR_NOT_ALLOWED',
        });
        return;
      }
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
    const updatedItem = await itemsData.updateItem(
      req.params.itemId,
      expirationDate,
      initialQuantity,
      quantity,
      cost,
      isUsed
    );
    if (updatedItem.itemUpdated) {
      return res.status(200).json({ item: updatedItem.item, status: 'success' });
    } else {
      throw new Error();
    }
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Server error',
      code: 'ERROR_SERVER',
    });
  }
});

// To get item from item table using item_id
router.get('/:itemId', auth, async (req, res) => {
  try {
    const itemById = await itemsData.getItemById(req.params.itemId);
    if (itemById.itemsFound) {
      const userId = req.user.userId;
      const productById = await productsData.getUserProductById(itemById.itemById.product_id);
      if (productById.productsFound) {
        if (userId !== productById.productById.user_id) {
          res.status(403).json({
            status: 'error',
            message: 'Not authorized to perform that action',
            code: 'ERROR_NOT_ALLOWED',
          });
          return;
        } else {
          res.status(200).json({
            item: itemById.itemById,
            status: 'success',
          });
          return;
        }
      }
    } else {
      res.status(404).json({
        status: 'error',
        message: 'Item not found',
        code: 'ERROR_NOT_FOUND_ITEM',
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      code: 'ERROR_SERVER',
    });
  }
});

// To delete an item inside item table
router.delete('/:itemId', auth, async (req, res) => {
  try {
    const itemById = await itemsData.getItemById(req.params.itemId);
    if (!itemById.itemsFound) {
      res.status(404).json({
        status: 'error',
        message: 'Item not found',
        code: 'ERROR_NOT_FOUND_ITEM',
      });
      return;
    }
    const userId = req.user.userId;
    const productById = await productsData.getUserProductById(itemById.itemById.product_id);
    if (productById.productsFound) {
      if (userId !== productById.productById.user_id) {
        res.status(403).json({
          status: 'error',
          message: 'Not authorized to perform that action',
          code: 'ERROR_NOT_ALLOWED',
        });
        return;
      }
    }
    const deletedItem = await itemsData.deleteItem(req.params.itemId);
    if (deletedItem.delete) {
      res.status(200).json({
        status: 'success',
      });
      return;
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
