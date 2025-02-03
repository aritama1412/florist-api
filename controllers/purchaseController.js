const Purchase = require("../models/Purchase");
const PurchaseDetail = require("../models/PurchaseDetail");
const Product = require("../models/Product");
const Supplier = require("../models/Supplier");

const getAllPurchases = async (req, res) => {
  try {
    const purchase = await Purchase.findAll({
      include: [
        {
          model: PurchaseDetail,
          include: [
            {
              model: Product,
              attributes: [
                "id_product",
                "id_supplier",
                "product_name",
                "price",
              ],
              include: [
                {
                  model: Supplier,
                  attributes: [
                    "id_supplier",
                    "supplier_name",
                    "phone",
                    "address",
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
    res.status(200).json({ status: "success", data: purchase });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

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

const getPurchaseById = async (req, res) => {
  try {
    const { id } = req.query;
    const purchase = await Purchase.findByPk(id, {
      include: [
        {
          model: PurchaseDetail,
          include: [
            {
              model: Product,
              attributes: [
                "id_product",
                "id_supplier",
                "product_name",
                "price",
              ],
              include: [
                {
                  model: Supplier,
                  attributes: [
                    "id_supplier",
                    "supplier_name",
                    "phone",
                    "address",
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
    if (!purchase) {
      return res
        .status(404)
        .json({ status: "error", message: "Data not found" });
    }
    res.status(200).json({ status: "success", data: purchase });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

const editPurchase = async (req, res) => {
  const transaction = await Purchase.sequelize.transaction();

  try {
    const { id_purchase, status, updated_by } = req.body;

    if (!id_purchase || !status || !updated_by) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields",
        data: req.body,
      });
    }

    const existingPurchase = await Purchase.findByPk(id_purchase);
    if (!existingPurchase) {
      return res.status(404).json({
        status: "error",
        message: "Purchase not found",
        data: null,
      });
    }

    await existingPurchase.update(
      {
        id_purchase,
        status,
        updated_by,
        updated_at: new Date(),
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      status: "success",
      message: "Purchase edited successfully",
      data: existingPurchase,
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
  getAllPurchases,
  createPurchase,
  getPurchaseById,
  editPurchase,
};
