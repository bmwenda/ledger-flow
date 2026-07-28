'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('transactions', 'idempotency_key', {
      type: Sequelize.UUID,
      allowNull: false
    });

    await queryInterface.addIndex("transactions", ["idempotency_key"], {
    unique: true,
    name: "transactions_idempotency_key_unique",
  });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex("transactions", "transactions_idempotency_key_unique");
    await queryInterface.removeColumn("transactions", "idempotency_key");
  }
};
