const express = require('express');
const auth = require('../middlewares/jwtAuth');
const verify = require('../middlewares/validation');
const shoppingData = require('../data/shopping');
const productsData = require('../data/products');

const router = express.Router();

// To add shopping item
router.post('/', auth, async (req, res) => {
  const { userId } = req.user;
  try {
    const { productId, quantity, cost } = req.body;
    if (
      productId === undefined ||
      quantity === undefined ||
      cost === undefined ||
      !verify.checkIfValidUUID(productId) ||
      !verify.checkIsProperNumber(quantity) ||
      !verify.checkIsProperNumber(cost)
    ) {
      res.status(422).json({
        status: 'error',
        message: 'Missing required values',
        code: 'ERROR_MISSING_REQUIRED_VALUES',
      });
      return;
    }
    if (quantity < 0 || cost < 0) {
      res.status(409).json({
        status: 'error',
        message: 'Negative numbers are invalid',
        code: 'ERROR_NEGATIVE_NUMBERS',
      });
      return;
    }
    const getProductDataById = await productsData.getUserProductById(productId, userId);
    if (!getProductDataById.productsFound) {
      res.status(404).json({
        status: 'error',
        message: 'Product not found',
        code: 'ERROR_NOT_FOUND_PRODUCT',
      });
      return;
    }

    if (userId !== getProductDataById.productById.userId) {
      res.status(403).json({
        status: 'error',
        message: 'Not authorized to perform that action',
        code: 'ERROR_NOT_ALLOWED',
      });
      return;
    }

    try {
      const item = await shoppingData.addShoppingItem(productId, quantity, cost);

      if (item.isNew) {
        res.status(201).json({ item: item.shoppingItem, status: 'success' });
        return;
      }
      res.status(200).json({ item: item.shoppingItem, status: 'success' });
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

// To get all shopping list items
router.get('/', auth, async (req, res) => {
  try {
    const { userId } = req.user;
    const allItems = await shoppingData.getShoppingItems(userId);
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
      message: error.message,
      code: 'ERROR_SERVER',
    });
  }
});

// To update an item
router.put('/:itemId', auth, async (req, res) => {
  const { itemId } = req.params;
  try {
    const { quantity, cost } = req.body;
    if (
      !verify.checkIfValidUUID(req.params.itemId) ||
      quantity === undefined ||
      cost === undefined ||
      !verify.checkIsProperNumber(quantity) ||
      !verify.checkIsProperNumber(cost)
    ) {
      res.status(422).json({
        status: 'error',
        message: 'Missing required values',
        code: 'ERROR_MISSING_REQUIRED_VALUES',
      });
      return;
    }

    if (quantity < 0 || cost < 0) {
      res.status(409).json({
        status: 'error',
        message: 'Negative numbers are invalid',
        code: 'ERROR_NEGATIVE_NUMBERS',
      });
      return;
    }
    const { userId } = req.user;
    const item = await shoppingData.getShoppingItemById(itemId);
    if (!item.itemsFound) {
      res.status(404).json({
        status: 'error',
        message: 'Item not found',
        code: 'ERROR_NOT_FOUND_ITEM',
      });
      return;
    }

    const productById = await productsData.getUserProductById(item.itemById.productId, userId);
    if (productById.productsFound) {
      if (userId !== productById.productById.userId) {
        res.status(403).json({
          status: 'error',
          message: 'Not authorized to perform that action',
          code: 'ERROR_NOT_ALLOWED',
        });
        return;
      }
    }
    const updatedItem = await shoppingData.updateShoppingItem(itemId, quantity, cost);
    if (updatedItem.itemUpdated) {
      res.status(200).json({ item: updatedItem.item, status: 'success' });
    } else {
      throw new Error();
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      code: 'ERROR_SERVER',
    });
  }
});

// To get item using item id
router.get('/:itemId', auth, async (req, res) => {
  const { itemId } = req.params;
  const { userId } = req.user;
  if (!verify.checkIfValidUUID(itemId)) {
    res.status(422).json({
      status: 'error',
      message: 'Missing required values',
      code: 'ERROR_MISSING_REQUIRED_VALUES',
    });
    return;
  }
  try {
    const itemById = await shoppingData.getShoppingItemById(itemId);
    if (itemById.itemsFound) {
      const productById = await productsData.getUserProductById(
        itemById.itemById.productId,
        userId
      );
      if (productById.productsFound) {
        if (userId !== productById.productById.userId) {
          res.status(403).json({
            status: 'error',
            message: 'Not authorized to perform that action',
            code: 'ERROR_NOT_ALLOWED',
          });
          return;
        }

        res.status(200).json({
          item: itemById.itemById,
          status: 'success',
        });
        return;
      }
    }

    res.status(404).json({
      status: 'error',
      message: 'Item not found',
      code: 'ERROR_NOT_FOUND_ITEM',
    });
    return;
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      code: 'ERROR_SERVER',
    });
  }
});

// To delete an item
router.delete('/:itemId', auth, async (req, res) => {
  try {
    const { userId } = req.user;
    if (!verify.checkIfValidUUID(req.params.itemId)) {
      res.status(422).json({
        status: 'error',
        message: 'Missing required values',
        code: 'ERROR_MISSING_REQUIRED_VALUES',
      });
      return;
    }

    const itemById = await shoppingData.getShoppingItemById(req.params.itemId);
    if (!itemById.itemsFound) {
      res.status(404).json({
        status: 'error',
        message: 'Item not found',
        code: 'ERROR_NOT_FOUND_ITEM',
      });
      return;
    }

    const productById = await productsData.getUserProductById(itemById.itemById.productId, userId);
    if (productById.productsFound) {
      if (userId !== productById.productById.userId) {
        res.status(403).json({
          status: 'error',
          message: 'Not authorized to perform that action',
          code: 'ERROR_NOT_ALLOWED',
        });
        return;
      }
    }
    const deletedItem = await shoppingData.deleteShoppingItem(req.params.itemId);
    if (deletedItem.delete) {
      res.status(200).json({
        status: 'success',
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
