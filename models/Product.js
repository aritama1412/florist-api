const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Image = require("./Image");
const Category = require("./Category");
const Supplier = require("./Supplier");

const Product = sequelize.define(
  "Product",
  {
    id_product: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_category: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_supplier: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    price: {
      type: DataTypes.DOUBLE(15, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("0", "1"),
      defaultValue: "1",
      comment: "0=nonaktif, 1=aktif",
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
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
    tableName: "products",
    timestamps: false,
  }
);

Product.hasMany(Image, {
  foreignKey: "id_product",
  sourceKey: "id_product",
});

Product.belongsTo(Category, {
  foreignKey: "id_category",
  targetKey: "id_category",
});

Product.belongsTo(Supplier, {
  foreignKey: "id_supplier",
  targetKey: "id_supplier",
});

module.exports = Product;
