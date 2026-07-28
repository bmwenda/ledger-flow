'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('transactions', ['from_account_id'], {
      name: 'transactions_from_account_id_idx',
    });
    await queryInterface.addIndex('transactions', ['to_account_id'], {
      name: 'transactions_to_account_id_idx',
    });
    await queryInterface.addIndex('transactions', ['created_at'], {
      name: 'transactions_created_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('transactions', 'transactions_from_account_id_idx');
    await queryInterface.removeIndex('transactions', 'transactions_to_account_id_idx');
    await queryInterface.removeIndex('transactions', 'transactions_created_at_idx');
  },
};
