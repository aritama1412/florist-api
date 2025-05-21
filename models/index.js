const sequelize = require("../config/database");

// Import all models
const Kas = require("./Kas");
const Sale = require("./Sale");
const Purchase = require("./Purchase");
const SaleDetail = require("./SaleDetail");
const PurchaseDetail = require("./PurchaseDetail");

// Define associations
Sale.hasMany(SaleDetail, { foreignKey: "id_sale" });
Sale.hasMany(Kas, { foreignKey: "id_sale" });

Purchase.hasMany(PurchaseDetail, { foreignKey: "id_purchase" });
Purchase.hasMany(Kas, { foreignKey: "id_purchase" });

Kas.belongsTo(Sale, { foreignKey: "id_sale" });
Kas.belongsTo(Purchase, { foreignKey: "id_purchase" });

// Export models
module.exports = {
    sequelize,
    Kas,
    Sale,
    Purchase,
    SaleDetail,
    PurchaseDetail,
};
