const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Category = sequelize.define(
  "Category",
  {
    id_category: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true, // Auto-increments the ID
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(45), // Matches VARCHAR(45)
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("0", "1"),
      allowNull: false,
      defaultValue: "1", // Default value for status
    },
  },
  {
    timestamps: false, // If you don't want createdAt and updatedAt fields
    tableName: "category", // Name of the actual table in the database
  }
);

module.exports = Category;
