const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const PurchaseDetail = require("./PurchaseDetail");
const { Op } = require("sequelize"); // Import Sequelize operators
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const SaleDetail = require("./SaleDetail");
const Kas = require("./Kas");

const Purchase = sequelize.define(
  "Purchase",
  {
    id_purchase: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    bill: {
      type: DataTypes.STRING(45),
      allowNull: false,
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
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("0", "1", "2", "3"),
      allowNull: false,
      defaultValue: "0",
      comment: "0=menunggu pembayaran, 1=proses, 2=selesai, 3=batal",
      get() {
        const statusMapping = {
          "0": "menunggu pembayaran",
          "1": "proses",
          "2": "selesai",
          "3": "batal",
        };
        return statusMapping[this.getDataValue("status")];
      },
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

// Add association
Purchase.hasMany(PurchaseDetail, {
  foreignKey: "id_purchase", // The foreign key
  sourceKey: "id_purchase", // The primary key
});

// has one kas
Purchase.hasOne(Kas, {
  foreignKey: "id_purchase",
  sourceKey: "id_purchase",
});

module.exports = Purchase;
