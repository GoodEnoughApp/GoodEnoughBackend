const Sequelize = require('sequelize-cockroachdb');

module.exports = (sequelize) => {
  const Product = sequelize.define(
    'product',
    {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
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
      category_id: {
        type: Sequelize.BOOLEAN,
      },
    },

    {
      timestamps: false,
      paranoid: false,
      freezeTableName: true,
    }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.category, { foreignKey: 'category_id' });
    Product.hasOne(models.user_product, { foreignKey: 'barcode' });
  };

  syncUser(Product);
  return Product;
};

const syncUser = async (model) => await model.sync();
