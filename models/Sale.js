const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const { Op } = require("sequelize"); // Import Sequelize operators
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const SaleDetail = require("./SaleDetail");

const Sale = sequelize.define(
  "Sale",
  {
    id_sale: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    bill: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    customer_name: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    customer_phone: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    customer_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    grand_total: {
      type: DataTypes.DOUBLE(15, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    status: {
      type: DataTypes.ENUM("0", "1", "2"),
      defaultValue: "0",
      comment: "0=pending, 1=lunas, 2=cancel",
    },
    date_sale: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    date_pick_up: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    pick_up_type: {
      type: DataTypes.ENUM("0", "1"),
      comment: "0=on the spot, 1=delivery",
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
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
    tableName: "sale",
    timestamps: false,
  }
);

// Add association
Sale.hasMany(SaleDetail, {
  foreignKey: "id_sale", // The foreign key
  sourceKey: "id_sale", // The primary key
});

module.exports = Sale;
