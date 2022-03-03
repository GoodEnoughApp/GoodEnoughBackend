const Sequelize = require('sequelize-cockroachdb');
module.exports = (sequelize) => {
  const userProduct = sequelize.define(
    'user_product',
    {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      user_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      category_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      barcode: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      barcode_type: {
        type: Sequelize.TEXT,
      },
      name: {
        type: Sequelize.TEXT,
      },
      alias: {
        type: Sequelize.TEXT,
      },
      description: {
        type: Sequelize.TEXT,
      },
      brand: {
        type: Sequelize.TEXT,
      },
      manufacturer: {
        type: Sequelize.TEXT,
      },
    },

    {
      timestamps: false,
      paranoid: false,
      freezeTableName: true,
    }
  );

  userProduct.associate = (models) => {
    userProduct.belongsTo(models.Category, { foreignKey: 'category_id' });
    userProduct.belongsTo(models.product, { foreignKey: 'barcode' });
    userProduct.belongsTo(models.users, { foreignKey: 'user_id' });
    userProduct.belongsTo(models.Item, { foreignKey: 'id' });
  };

  syncUser(userProduct);
  return userProduct;
};

const syncUser = async (model) => {
  return await model.sync();
};
