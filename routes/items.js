const express = require('express');
const auth = require('../middlewares/jwtAuth');
const verify = require('../middlewares/validation');
const itemsData = require('../data/items');
const productsData = require('../data/products');
const router = express.Router();

// To get item from item table based on product_id and used condition
router.get('/', auth, async (req, res) => {
  try {
    let errorParams = [];
    if (req.query) {
      if (req.query.used) {
        if (verify.validString(req.query.used) && req.query.used.toLowerCase() === 'true') {
          req.query.used = true;
        }
        if (verify.validString(req.query.used) && req.query.used.toLowerCase() === 'false') {
          req.query.used = false;
        }
        if (!verify.validBoolean(req.query.used)) {
          errorParams.push('used');
        }
      }
      if (req.query.productId) {
        if (!verify.checkIfValidUUID(req.query.productId)) {
          errorParams.push('productId');
        }
      }
    }
    if (errorParams.length > 0) {
      res.status(422).json({
        status: 'error',
        message: `${errorParams} are invalid`,
        code: 'ERROR_INAVLID_VALUES',
      });
      return;
    }
    const userId = req.user.userId;
    const allItems = await itemsData.getItems(req.query.productId, req.query.used, userId);
    if (allItems.itemsFound) {
      res.status(200).json({
        items: allItems.allItems,
        status: 'success',
      });
      return;
    } else {
      res.status(404).json({
        status: 'error',
        message: 'Items not found',
        code: 'ERROR_NOT_FOUND_ITEM',
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

// To update an item in Item table
router.put('/:itemId', auth, async (req, res) => {
  try {
    const { expirationDate, initialQuantity, quantity, cost, isUsed } = req.body;
    let errorParams = [];
    if (expirationDate === undefined) {
      errorParams.push('expirationDate');
    }
    if (initialQuantity === undefined) {
      errorParams.push('initialQuantity');
    }
    if (quantity === undefined) {
      errorParams.push('quantity');
    }
    if (cost === undefined) {
      errorParams.push('cost');
    }
    if (isUsed === undefined) {
      errorParams.push('isUsed');
    }
    if (errorParams.length > 0) {
      res.status(422).json({
        status: 'error',
        message: `${errorParams} are missing`,
        code: 'ERROR_MISSING_VALUES',
      });
      return;
    }
    if (!verify.validIsoDate(expirationDate)) {
      errorParams.push('expirationDate');
    }
    if (!verify.checkIsProperNumber(initialQuantity)) {
      errorParams.push('initialQuantity');
    }
    if (!verify.checkIsProperNumber(quantity)) {
      errorParams.push('quantity');
    }
    if (!verify.checkIsProperNumber(cost)) {
      errorParams.push('cost');
    }
    if (!verify.validBoolean(isUsed)) {
      errorParams.push('isUsed');
    }
    if (errorParams.length > 0) {
      res.status(422).json({
        status: 'error',
        message: `${errorParams} are invalid`,
        code: 'ERROR_INVALID_VALUES',
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
    try {
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
    return res.status(500).json({
      status: 'error',
      message: error.message,
      code: 'ERROR_SERVER',
    });
  }
});

// To get item from item table using item_id
router.get('/:itemId', auth, async (req, res) => {
  try {
    if (!verify.checkIfValidUUID(req.params.itemId)) {
      res.status(422).json({
        status: 'error',
        message: 'Incorrect Item Id',
        code: 'ERROR_INVALID_VALUES',
      });
      return;
    }
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
      message: error.message,
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
    try {
      const deletedItem = await itemsData.deleteItem(req.params.itemId);
      if (deletedItem.delete) {
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
