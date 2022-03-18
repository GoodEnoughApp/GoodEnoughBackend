const express = require('express');
const auth = require('../middlewares/jwtAuth');
const shoppingData = require('../data/shopping');
const productsData = require('../data/products');
const router = express.Router();

// To add shopping item
router.post('/', auth, async (req, res) => {
  try {
    const { productId, quantity, cost } = req.body;
    if (productId === undefined || quantity === undefined || cost === undefined) {
      res.status(422).json({
        status: 'error',
        message: 'Missing required values',
        code: 'ERROR_MISSING_REQUIRED_VALUES',
      });
      return;
    }
    const getProductDataById = await productsData.getUserProductById(productId);
    if (!getProductDataById.productsFound) {
      res.status(404).json({
        status: 'error',
        message: 'Product not found',
        code: 'ERROR_NOT_FOUND_PRODUCT',
      });
      return;
    }
    const userId = req.user.userId;
    if (userId !== getProductDataById.productById.user_id) {
      res.status(403).json({
        status: 'error',
        message: 'Not authorized to perform that action',
        code: 'ERROR_NOT_ALLOWED',
      });
      return;
    } else {
      const item = await shoppingData.addShoppingItem(productId, quantity, cost);
      if (item.isNew) {
        res.status(201).json({ item: item.shoppingItem, status: 'success' });
      } else {
        res.status(500).json({
          status: 'error',
          message: 'Server error',
          code: 'ERROR_SERVER',
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

// To get all shopping list items
router.get('/', auth, async (req, res) => {
  try {
    const allItems = await shoppingData.getShoppingItems();
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
  try {
    const { quantity, cost } = req.body;
    if (quantity === undefined || cost === undefined) {
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
    const updatedItem = await shoppingData.updateShoppingItem(req.params.itemId, quantity, cost);
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
  try {
    const itemById = await shoppingData.getShoppingItemById(req.params.itemId);
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

// To delete an item
router.delete('/:itemId', auth, async (req, res) => {
  try {
    const itemById = await shoppingData.getShoppingItemById(req.params.itemId);
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
