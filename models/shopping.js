const Sequelize = require('sequelize-cockroachdb');
module.exports = (sequelize) => {
  const shopping = sequelize.define(
    'shopping_list_item',
    {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      product_id: {
        type: Sequelize.UUIDV4,
      },
      quantity: {
        type: Sequelize.INTEGER,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      cost: {
        type: Sequelize.FLOAT,
      },
    },

    {
      timestamps: false,
      paranoid: false,
      freezeTableName: true,
    }
  );

  shopping.associate = (models) => {
    shopping.hasOne(models.user_product, { foreignKey: 'id' });
  };

  syncUser(shopping);
  return shopping;
};

const syncUser = async (model) => {
  return await model.sync();
};