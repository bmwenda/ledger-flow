import { DataTypes, Model } from "sequelize";
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
  Sequelize
} from "sequelize";
import type { Account } from "./Account.ts";


export class User extends Model<InferAttributes<User, { omit:  "createdAt" | "updatedAt" }>, InferCreationAttributes<User, { omit:  "createdAt" | "updatedAt"}>> {
  declare id: CreationOptional<string>;
  declare firstName: string;
  declare email: string;
  declare lastName: string | null;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare account?: NonAttribute<Account>;
}

export function initUser(sequelize: Sequelize): void {
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    lastName: DataTypes.STRING
  },
  { sequelize, underscored: true });
}
