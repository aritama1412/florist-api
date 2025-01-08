const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Adjust the path to your database configuration
const Category = require("./Category");

const Supplier = sequelize.define(
  "Supplier",
  {
    id_supplier: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_category: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    supplier_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("0", "1"),
      defaultValue: "1",
      comment: "0=nonaktif, 1=aktif",
    },
  },
  {
    tableName: "suppliers", // Explicitly sets the table name to 'products'
    timestamps: false, // Prevent Sequelize from adding `createdAt` and `updatedAt` fields
  }
);

// Define the relationship
Supplier.belongsTo(Category, {
  foreignKey: "id_category",
  targetKey: "id_category",
});

module.exports = Supplier;
