'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addIndex('users', ['first_name'], {
      name: 'users_first_name_idx',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('users', 'users_first_name_idx');
  },
};
