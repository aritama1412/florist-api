const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("tes_florist", "root", "", {
// const sequelize = new Sequelize("pondokd2_test_florist", "pondokd2_ica", "Inipassword", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = sequelize;
