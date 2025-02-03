const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("tes_florist", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = sequelize;
