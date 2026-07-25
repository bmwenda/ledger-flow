// seeders/20260725120000-large-scale-perf-data.js
'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    // scale factors for benchmarking
    const USER_COUNT = 20000;      // 20k users
    const TRANSACTION_COUNT = 200000; // 200k transactions
    const BATCH_SIZE = 5000;

    console.log(`\n🚀 Generating ${USER_COUNT} users and accounts...`);

    const userIds = [];
    const accountIds = [];
    const users = [];
    const accounts = [];

    for (let i = 0; i < USER_COUNT; i++) {
      const uId = uuidv4();
      const aId = uuidv4();
      userIds.push(uId);
      accountIds.push(aId);

      const now = new Date();

      users.push({
        id: uId,
        first_name: `First_${i}`,
        last_name: `Last_${i}`,
        email: `user_${i}_${uId.substring(0, 8)}@ledgerflow.dev`,
        created_at: now,
        updated_at: now
      });

      accounts.push({
        id: aId,
        user_id: uId,
        currency: i % 2 === 0 ? 'USD' : 'EUR',
        balance: parseFloat((Math.random() * 10000 + 500).toFixed(4)), // seed with initial money
        created_at: now,
        updated_at: now
      });
    }

    // Bulk insert users & accounts in chunks to protect memory
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      await queryInterface.bulkInsert('users', users.slice(i, i + BATCH_SIZE));
      await queryInterface.bulkInsert('accounts', accounts.slice(i, i + BATCH_SIZE));
    }

    console.log(`✨ Inserted ${USER_COUNT} users and accounts successfully.`);
    console.log(`💸 Generating ${TRANSACTION_COUNT} transactions across accounts...`);

    let transactionsBatch = [];
    const statuses = ['pending', 'completed', 'failed'];

    for (let i = 0; i < TRANSACTION_COUNT; i++) {
      // Pick two random distinct accounts
      const fromIdx = Math.floor(Math.random() * accountIds.length);
      let toIdx = Math.floor(Math.random() * accountIds.length);
      while (toIdx === fromIdx) {
        toIdx = Math.floor(Math.random() * accountIds.length);
      }

      const now = new Date();
      // Scatter dates across the last 30 days to test indexing by date range later
      now.setDate(now.getDate() - Math.floor(Math.random() * 30));

      transactionsBatch.push({
        id: uuidv4(),
        amount: parseFloat((Math.random() * 150 + 1).toFixed(4)),
        from_account_id: accountIds[fromIdx],
        to_account_id: accountIds[toIdx],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        created_at: now,
        updated_at: now
      });

      // Flush batch to database when size limit reached
      if (transactionsBatch.length === BATCH_SIZE) {
        await queryInterface.bulkInsert('transactions', transactionsBatch);
        transactionsBatch = [];
      }
    }

    if (transactionsBatch.length > 0) {
      await queryInterface.bulkInsert('transactions', transactionsBatch);
    }

    console.log(`⚡ Concurrency test data generation complete!`);
  },

  async down(queryInterface, Sequelize) {
    // Tables cleared in reverse dependency order
    await queryInterface.bulkDelete('transactions', null, {});
    await queryInterface.bulkDelete('accounts', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
