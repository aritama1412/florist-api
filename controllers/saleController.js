const helper = require("../helper/helper");
const Sale = require("../models/Sale");
const SaleDetail = require("../models/SaleDetail");
const Product = require("../models/Product");
const { Op } = require("sequelize");

// ✅ Create a new sale
const createSale = async (req, res) => {
  const transaction = await Sale.sequelize.transaction();
  // get yyyy-mm-dd

  const today = helper.getToday();
  const todayInv = helper.getCurrentDateInv();
  try {
    let newBill;
    const {
      customer_name,
      customer_phone,
      customer_address,
      grand_total,
      status,
      date_sale,
      date_pick_up,
      pick_up_type,
      created_by,
      details,
    } = req.body;

    // Define start and end of the day
    const startOfDay = `${today} 00:00:00`;
    const endOfDay = `${today} 23:59:59`;

    // Search for the last invoice created today
    const lastInvoice = await Sale.findOne({
      where: {
        created_at: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
      order: [["created_at", "DESC"]],
    });

    if (lastInvoice != null) {
      const last4Digits = lastInvoice.bill.slice(-4); // Extract last 4 digits
      const newLast4Digits = (parseInt(last4Digits, 10) + 1)
        .toString()
        .padStart(4, "0"); // Increment and pad to 4 digits
      newBill = lastInvoice.bill.slice(0, -4) + newLast4Digits; // Combine prefix with new 4-digit number
    } else {
      newBill = `INV${todayInv}0001`; // Default new bill
    }

    // ✅ Create sale
    const newSale = await Sale.create(
      {
        bill: newBill,
        customer_name,
        customer_phone,
        customer_address,
        grand_total,
        status,
        date_sale,
        date_pick_up,
        pick_up_type,
        created_by,
      },
      { transaction }
    );

    // ✅ Create sale details
    const saleDetailsData = details.map((detail) => ({
      id_sale: newSale.id_sale,
      id_product: detail.id_product,
      price: detail.price,
      quantity: detail.quantity,
      sub_total: detail.price * detail.quantity,
    }));

    await SaleDetail.bulkCreate(saleDetailsData, { transaction });

    await transaction.commit();

    // add saleDetailsData into newSale
    const saleData = newSale.toJSON();
    saleData.details = saleDetailsData;

    return res.status(201).json({
      status: "success",
      message: "Sale created successfully",
      data: saleData,
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

const editSale = async (req, res) => {
  const transaction = await Sale.sequelize.transaction();

  try {
    const { id_sale, status, updated_by } = req.body;

    if (!id_sale || !status || !updated_by) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields",
        data: req.body,
      });
    }

    const existingSale = await Sale.findByPk(id_sale);
    if (!existingSale) {
      return res.status(404).json({
        status: "error",
        message: "Transaction not found",
        data: null,
      });
    }

    await existingSale.update(
      {
        id_sale,
        status,
        updated_by,
        updated_at: new Date(),
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      status: "success",
      message: "Transaction edited successfully",
      data: existingSale,
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

// ✅ Get all sales
const getAllSales = async (req, res) => {
  try {
    const sales = await Sale.findAll({ include: SaleDetail });
    res.status(200).json({ status: "success", data: sales });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// ✅ Get a sale by ID
const getSaleById = async (req, res) => {
  try {
    const { id } = req.query;
    const sale = await Sale.findByPk(id, {
      include: [
        {
          model: SaleDetail,
          include: Product, // Include Product in SaleDetail
        },
      ],
    });
    if (!sale) {
      return res
        .status(404)
        .json({ status: "error", message: "Sale not found" });
    }
    res.status(200).json({ status: "success", data: sale });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

const checkTransaction = async (req, res) => {
  try {
    const { invoice } = req.query;

    const { limit = 20, offset = 0 } = req.query;
    let sale;
    if (invoice.substring(0, 3).toLowerCase() == "inv") {
      sale = await Sale.findAll({
        where: {
          // where bill = invoice
          bill: {
            [Op.eq]: invoice,
          },
        },
        limit,
        offset,
        include: [
          {
            model: SaleDetail,
            required: false, // Products with or without images
            include: [
              {
                model: Product, // Include Product associated with each SaleDetail
                attributes: ["id_product", "product_name", "price"], // Fetch only specific fields
              },
            ],
          },
        ],
      });
    } else {
      sale = await Sale.findAll({
        where: {
          customer_phone: {
            [Op.like]: `%${invoice}%`,
          },
        },
        limit,
        offset,
        include: [
          {
            model: SaleDetail,
            required: false, // Products with or without images
            include: [
              {
                model: Product, // Include Product associated with each SaleDetail
                attributes: ["id_product", "product_name", "price"], // Fetch only specific fields
              },
            ],
          },
        ],
      });
    }

    if (!sale) {
      return res
        .status(404)
        .json({ status: "error", message: "Sale not found" });
    }
    res.status(200).json({ status: "success", data: sale });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = {
  createSale,
  editSale,
  getAllSales,
  getSaleById,
  checkTransaction,
};
