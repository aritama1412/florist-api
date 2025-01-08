const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(55),
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("0", "1"),
      defaultValue: "1",
      allowNull: false,
      comment: "0=nonaktif, 1=aktif",
    },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);

module.exports = User;
