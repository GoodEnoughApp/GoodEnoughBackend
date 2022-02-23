const Sequelize = require('sequelize-cockroachdb');

module.exports = (sequelize) => {
    let verificationCode;

    verificationCode = sequelize.define(
        'verification_code',
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

    // verificationCode.associate = (models) => {};

    return verificationCode;
};
