const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Purchase = sequelize.define(
  "Purchase",
  {
    id_purchase: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    grand_total: {
      type: DataTypes.DOUBLE(15, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    purchase_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("0", "1", "2"),
      allowNull: false,
      defaultValue: "0",
      comment: "0=pending, 1=lunas, 2=cancel",
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "purchase",
    timestamps: false,
  }
);

module.exports = Purchase;
