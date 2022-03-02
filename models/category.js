const Sequelize = require('sequelize-cockroachdb');

module.exports = (sequelize) => {
  const Category = sequelize.define(
    'Category',
    {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      name: {
        type: Sequelize.TEXT,
      },
    },

    {
      timestamps: false,
      paranoid: false,
      freezeTableName: true,
    }
  );

  Category.associate = (models) => {
    Category.hasMany(models.product, { foreignKey: 'id', as: 'category_id' });
  };

  syncUser(Category);
  return Category;
};

const syncUser = async (model) => {
  return await model.sync();
};
