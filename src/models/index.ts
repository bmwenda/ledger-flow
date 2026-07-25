import { Sequelize } from "sequelize";
import { User, initUser } from "./User.ts";
import { Account, initAccount } from "./Account.ts";
import { Transaction, initTransaction  } from "./Transaction.ts";

export function initModels(sequelize: Sequelize): void {
  initUser(sequelize);
  initAccount(sequelize);
  initTransaction(sequelize);

  User.hasOne(Account, { foreignKey: "userId", as: "account" });
  Account.belongsTo(User, { foreignKey: "userId", as: "user" });

  Account.hasMany(Transaction, { foreignKey: "fromAccountId", as: "sentTransactions" });
  Account.hasMany(Transaction, { foreignKey: "toAccountId", as: "receivedTransactions" });

  Transaction.belongsTo(Account, { foreignKey: "toAccountId", as: "toAccount" });
  Transaction.belongsTo(Account, { foreignKey: "fromAccountId", as: "fromAccount" });
}
