const Purchase = require("../models/Purchase");
const PurchaseDetail = require("../models/PurchaseDetail");

const createPurchase = async (req, res) => {
  const transaction = await Purchase.sequelize.transaction();
  try {
    const { grand_total, created_by, details } = req.body;

    // ✅ Create purchase
    const newPurchase = await Purchase.create(
      {
        grand_total,
        purchase_date: new Date(),
        status: "0",
        created_by,
      },
      { transaction }
    );

    // ✅ Create purchase details
    const purchaseDetailsData = details.map((detail) => ({
      id_purchase: newPurchase.id_purchase,
      id_product: detail.id_product,
      price: detail.price,
      quantity: detail.quantity,
      sub_total: detail.price * detail.quantity,
    }));

    await PurchaseDetail.bulkCreate(purchaseDetailsData, { transaction });

    await transaction.commit();

    // ✅ Convert newPurchase to plain object and attach purchaseDetailsData
    const purchaseData = newPurchase.toJSON();
    purchaseData.details = purchaseDetailsData;

    return res.status(201).json({
      status: "success",
      message: "Purchase created successfully",
      data: purchaseData,
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      status: "error",
      message: error.message,
      data: null,
    });
  }
};

module.exports = {
  createPurchase,
};
