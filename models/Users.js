const Sequelize = require('sequelize-cockroachdb');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'user',
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
      email: {
        type: Sequelize.TEXT,
      },
      password: {
        type: Sequelize.TEXT,
      },
      is_activated: {
        type: Sequelize.BOOLEAN,
      },
    },

    {
      timestamps: false,
      paranoid: false,
      freezeTableName: true,
    }
  );

  User.associate = (models) => {
    User.hasMany(models.user_product, { foreignKey: 'id', as: 'user_id' });
  };

  syncUser(User);
  return User;
};

const syncUser = async (model) => await model.sync();
