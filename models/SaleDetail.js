const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Product = require("./Product");

const SaleDetail = sequelize.define(
  "SaleDetail",
  {
    id_sale_detail: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_sale: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_product: {
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
    tableName: "sale_details",
    timestamps: false,
  }
);

// Define the relationship
SaleDetail.belongsTo(Product, {
  foreignKey: "id_product", // Foreign key in SaleDetail
  targetKey: "id_product", // Primary key in Product
});

module.exports = SaleDetail;
