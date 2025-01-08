const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Adjust path as needed
const Product = require("./Product"); // Import Product model for association

const Image = sequelize.define(
  "Image",
  {
    id_image: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_product: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("1", "0"),
      defaultValue: "1",
      comment: "1=aktif, 0=nonaktif",
    },
  },
  {
    tableName: "images",
    timestamps: false, // Since created_at and updated_at are not present
  }
);

// // Add association for Image and Product
// Image.belongsTo(Product, {
//   foreignKey: "id_product", // The foreign key in the Image table
//   targetKey: "id_product", // The primary key in the Product table
// });

module.exports = Image;
