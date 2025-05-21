const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Kas = sequelize.define(
  "Kas",
  {
    idkas: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_sale: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_purchase: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bill: {
      type: DataTypes.STRING(155),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("in", "out"),
      defaultValue: "in",
    },
    total: {
      type: DataTypes.DOUBLE(15, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    tanggal: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    keterangan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "kas",
    timestamps: false,
  }
);

module.exports = Kas;
