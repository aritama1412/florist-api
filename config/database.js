const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("florist", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = sequelize;
