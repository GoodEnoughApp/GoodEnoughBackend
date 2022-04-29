const Sequelize = require('sequelize-cockroachdb');

module.exports = (sequelize) => {
  const Category = sequelize.define(
    'category',
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
      category_type: {
        type: Sequelize.ENUM('category_type'),
        allowNull: true,
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

  return Category;
};
