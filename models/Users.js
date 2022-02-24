const Sequelize = require('sequelize-cockroachdb');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'users',
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
    }
  );

  // User.associate = (models) => {};

  return User;
};
