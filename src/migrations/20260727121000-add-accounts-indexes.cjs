'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('accounts', ['balance'], {
      name: 'accounts_balance_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('accounts', 'accounts_balance_idx');
  },
};
