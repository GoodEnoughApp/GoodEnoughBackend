const Sequelize = require('sequelize-cockroachdb');
module.exports = (sequelize) => {
  const Item = sequelize.define(
    'Item',
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
      expiration_date: {
        type: Sequelize.DATE,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      quantity: {
        type: Sequelize.INTEGER,
      },
      initial_quantity: {
        type: Sequelize.INTEGER,
      },
      cost: {
        type: Sequelize.FLOAT,
      },
      is_used: {
        type: Sequelize.BOOLEAN,
      },
    },

    {
      timestamps: false,
      paranoid: false,
      freezeTableName: true,
    }
  );

  Item.associate = (models) => {
    Item.belongsTo(models.user_product, { foreignKey: 'product_id', targetKey: 'id' });
  };

  syncUser(Item);
  return Item;
};

const syncUser = async (model) => {
  return await model.sync();
};
