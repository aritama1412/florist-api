const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Product = require("./Product");

const PurchaseDetail = sequelize.define(
  "PurchaseDetail",
  {
    id_purchase_detail: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_purchase: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_product: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_supplier: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DOUBLE(15, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sub_total: {
      type: DataTypes.DOUBLE(15, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
  },
  {
    tableName: "purchase_details",
    timestamps: false,
  }
);

PurchaseDetail.belongsTo(Product, {
  foreignKey: "id_product", // Foreign key in SaleDetail
  targetKey: "id_product", // Primary key in Product
});

module.exports = PurchaseDetail;
