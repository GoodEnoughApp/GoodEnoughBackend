const express = require('express');
const auth = require('../middlewares/jwtAuth');
const itemsData = require('../data/items');
const productsData = require('../data/products');
const router = express.Router();

// To get item from item table based on product_id and used condition
router.get('/', auth, async (req, res) => {
  try {
    if (req.query && req.query.used === 'true') {
      req.query.used = true;
    } else {
      req.query.used = false;
    }
    const allItems = await itemsData.getItems(req.query.productId, req.query.used);
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
      return res.status(422).json({
        status: 'error',
        message: 'Missing required values',
        code: 'ERROR_MISSING_REQUIRED_VALUES',
      });
    }
    const itemById = await itemsData.getItemById(req.params.itemId);
    if (!itemById.itemsFound) {
      res.status(404).json({
        status: 'error',
        message: 'Item not found',
        code: 'ERROR_NOT_FOUND_ITEM',
      });
    }
    const userId = req.user.userId;
    const productById = await productsData.getUserProductById(itemById.itemById.product_id);
    if (productById.productsFound) {
      if (userId !== productById.productById.user_id) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to perform that action',
          code: 'ERROR_NOT_ALLOWED',
        });
      }
    }
    let expDate = new Date(Date.parse(expirationDate));
    let currentDate = new Date();
    if (expDate.getTime() < currentDate.getTime()) {
      return res.status(409).json({
        status: 'error',
        message: 'Expiration date in the past',
        code: 'ERROR_PAST_EXPIRATION_DATE',
      });
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
          return res.status(403).json({
            status: 'error',
            message: 'Not authorized to perform that action',
            code: 'ERROR_NOT_ALLOWED',
          });
        } else {
          return res.status(200).json({
            item: itemById.itemById,
            status: 'success',
          });
        }
      }
    } else {
      return res.status(404).json({
        status: 'error',
        message: 'Item not found',
        code: 'ERROR_NOT_FOUND_ITEM',
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

// To delete an item inside item table
router.delete('/:itemId', auth, async (req, res) => {
  try {
    const itemById = await itemsData.getItemById(req.params.itemId);
    if (!itemById.itemsFound) {
      return res.status(404).json({
        status: 'error',
        message: 'Item not found',
        code: 'ERROR_NOT_FOUND_ITEM',
      });
    }
    const userId = req.user.userId;
    const productById = await productsData.getUserProductById(itemById.itemById.product_id);
    if (productById.productsFound) {
      if (userId !== productById.productById.user_id) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to perform that action',
          code: 'ERROR_NOT_ALLOWED',
        });
      }
    }
    const deletedItem = await itemsData.deleteItem(req.params.itemId);
    if (deletedItem.delete) {
      return res.status(200).json({
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
