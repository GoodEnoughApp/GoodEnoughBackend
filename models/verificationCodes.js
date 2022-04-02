const { CHAR } = require('sequelize');
const Sequelize = require('sequelize-cockroachdb');

module.exports = (sequelize) => {
  const verificationCodes = sequelize.define(
    'verification_code',
    {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        references: 'user', // table name
        referencesKey: 'id', // the PK column name
      },
      code: {
        type: CHAR(6),
      },
    },

    {
      timestamps: false,
      paranoid: false,
      freezeTableName: true,
    }
  );
  return verificationCodes;
};
