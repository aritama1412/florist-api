const Purchase = require("../models/Purchase");
const PurchaseDetail = require("../models/PurchaseDetail");
const Product = require("../models/Product");
const Supplier = require("../models/Supplier");
const { Sequelize, Op } = require("sequelize"); // Import Sequelize and Op from Sequelize
const fs = require("fs");
const Kas = require("../models/Kas");

const getAllPurchases = async (req, res) => {
  try {
    // order by created_at DESC
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
      order: [["purchase_date", "DESC"]],
    });
    res.status(200).json({ status: "success", data: purchase });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

const createPurchase = async (req, res) => {
  const transaction = await Purchase.sequelize.transaction();
  try {
    const { grand_total, created_by, note, details } = req.body;

    // ✅ Format today's date in yyyyMMdd format
    const today = new Date();
    const formattedDate =
      today.getFullYear() +
      ("0" + (today.getMonth() + 1)).slice(-2) +
      ("0" + today.getDate()).slice(-2);

    // ✅ Generate the bill number
    const lastBill = await Purchase.findOne({
      where: {
        bill: {
          [Op.like]: `INVP${formattedDate}%`, // Use Op.like to query for similar bills
        },
      },
      order: [["created_at", "DESC"]], // Get the latest purchase
    });

    let newBillNumber = "0001"; // Default to 0001 if no previous bill found

    if (lastBill) {
      // Extract the last number from the bill string and increment it
      const lastNumber = parseInt(lastBill.bill.slice(-4), 10);
      const newNumber = lastNumber + 1;
      newBillNumber = newNumber.toString().padStart(4, "0");
    }

    const newBill = `INVP${formattedDate}${newBillNumber}`;

    // ✅ Create the purchase record
    const newPurchase = await Purchase.create(
      {
        grand_total,
        bill: newBill,
        note,
        purchase_date: new Date(),
        status: "0",
        created_by,
      },
      { transaction }
    );

    // ✅ Create the purchase details
    const purchaseDetailsData = details.map((detail) => ({
      id_purchase: newPurchase.id_purchase,
      id_product: detail.id_product,
      id_supplier: detail.id_supplier,
      price: detail.price,
      quantity: detail.quantity,
      sub_total: detail.price * detail.quantity,
    }));

    // the data is id_product, loop it and get product name from model Product
    const productNames = await Promise.all(
      details.map(async (detail) => {
        const product = await Product.findByPk(detail.id_product, { transaction });
        return product.product_name + " : " + detail.quantity ;
      })
    );

    // create a string message
    const message = productNames.join(", ");

    // get the id sale
    const id_purchase = newPurchase.id_purchase;
    const kas = await Kas.create(
      {
        id_purchase,
        type: "out",
        total: grand_total,
        tanggal: new Date(),
        bill: newBill,
        keterangan: message,
      },
      { transaction }
    );

    await PurchaseDetail.bulkCreate(purchaseDetailsData, { transaction });

    // update stock in product
    // Step 1: Retrieve current stock for the specified products
    const productIds = details.map((detail) => detail.id_product);
    const products = await Product.findAll({
      where: { id_product: productIds },
      transaction,
    });
    
    // Step 2: Map updated stock values
    const updatedProducts = products.map((product) => {
      const detail = details.find((detail) => detail.id_product === product.id_product);
      if (!detail) {
        throw new Error(`Detail not found for product ID: ${product.id_product}`);
      }
      return {
        id_product: product.id_product,
        stock: product.stock + Number(detail.quantity),
      };
    });

    // Step 3: Update the database with new stock values
    await Promise.all(
      updatedProducts.map((updatedProduct) =>
        Product.update(
          { stock: updatedProduct.stock },
          { where: { id_product: updatedProduct.id_product }, transaction }
        )
      )
    );

    await transaction.commit();

    // ✅ Convert newPurchase to plain object and attach purchaseDetailsData
    const purchaseData = newPurchase.toJSON();
    purchaseData.details = purchaseDetailsData;

    return res.status(201).json({
      status: "success",
      message: "Purchase created successfully",
      details: details,
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
    const { id_purchase, status, note, updated_by } = req.body;

    if (!id_purchase || !status || !updated_by) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields",
        data: req.body,
      });
    }

    let newStatus = '';
    if(status == "menunggu pembayaran"){
      newStatus = "0";
    }else if (status == "proses"){
      newStatus = "1";
    }else if(status == "selesai"){
      newStatus = "2";
    }else if(status == "batal"){
      newStatus = "3";
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
        status: newStatus,
        note,
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
