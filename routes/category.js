const express = require('express');
const auth = require('../middlewares/jwtAuth');
const categoryData = require('../data/category');

const router = express.Router();

// Get list of all categories
router.get('/', auth, async (req, res) => {
  try {
    const allCategory = await categoryData.getCategory();
    if (allCategory.categoryFound) {
      res.status(200).json({
        categories: allCategory.allCategory,
        status: 'success',
      });
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
