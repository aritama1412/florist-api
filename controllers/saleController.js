const helper = require("../helper/helper");
const Sale = require("../models/Sale");
const SaleDetail = require("../models/SaleDetail");
const Product = require("../models/Product");
const Kas = require("../models/Kas");
const { Op, Sequelize } = require("sequelize");
const sequelize = require("../config/database"); // Import sequelize instance
const Image = require("../models/Image");


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
      date_estimation,
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
        date_estimation: null,
        pick_up_type,
        created_by,
      },
      { transaction }
    );

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
    const id_sale = newSale.id_sale;
    const kas = await Kas.create(
      {
        id_sale,
        type: "in",
        total: grand_total,
        tanggal: date_sale,
        bill: newBill,
        keterangan: message,
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

    // Update product stock
    for (const detail of details) {
      const product = await Product.findByPk(detail.id_product);
      product.stock -= detail.quantity;
      await product.save({ transaction });
    }

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
    const { id_sale, date_estimation, date_received, status, updated_by } = req.body;

    if (!id_sale || !status || !updated_by) {
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

    const existingSale = await Sale.findByPk(id_sale);
    if (!existingSale) {
      return res.status(404).json({
        status: "error",
        message: "Transaction not found",
        data: null,
      });
    }
    const formatDate = (date) => {
      const { year, month, day } = date;
      // Ensure month and day are always two digits
      const formattedMonth = month.toString().padStart(2, '0');
      const formattedDay = day.toString().padStart(2, '0');
      return `${year}-${formattedMonth}-${formattedDay}`;
    };
    
    const formattedDateEstimation = formatDate(date_estimation);
    const formattedDateReceived = formatDate(date_received);

    console.log('formattedDateEstimation', formattedDateEstimation)
    console.log('formattedDateReceived', formattedDateReceived)

    await existingSale.update(
      {
        id_sale,
        status: newStatus,
        date_estimation: formattedDateEstimation,
        date_received: formattedDateReceived,
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

const getSalesPerMonth = async (req, res) => {
  try {
    const { year } = req.query;
    if (!year) {
      return res.status(400).json({
        status: "error",
        message: "Year is required",
      });
    }

    // Array of month names in Indonesian or localized format
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    // Generate all months of the year with month names
    const months = monthNames.map((name, i) => ({
      month: name,
      total_sales: 0, // Default value
    }));

    // Query sales data from the database
    const sales = await Sale.findAll({
      where: {
        created_at: {
          [Op.gte]: new Date(`${year}-01-01`),
          [Op.lte]: new Date(`${year}-12-31`),
        },
      },
      attributes: [
        [Sequelize.fn("MONTH", Sequelize.col("created_at")), "month_index"], // Get month index (1-12)
        [Sequelize.fn("SUM", Sequelize.col("grand_total")), "total_sales"],
      ],
      group: ["month_index"],
      raw: true, // Returns plain objects instead of Sequelize instances
    });

    // Merge sales data into the months array
    const mergedData = months.map((month, i) => {
      const sale = sales.find((s) => parseInt(s.month_index, 10) === i + 1);
      return sale ? { ...month, total_sales: parseFloat(sale.total_sales) } : month;
    });

    res.status(200).json({ status: "success", data: mergedData });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

const getProductSales = async (req, res) => {
  try {
    // Extract the year from query parameters
    const { year } = req.query;

    // Ensure the year parameter is provided
    if (!year) {
      return res.status(400).json({ error: "Year parameter is required." });
    }

    // Define the start and end of the year
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    // Query sale within range, then left join saledetails
    const sales = await Sale.findAll({
      where: {
        date_sale: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
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

    // i want to get total quantity each product sold 
    const productSales = {};

    sales.forEach((sale) => {
      sale.SaleDetails.forEach((saleDetail) => {
        const productName = saleDetail.Product.product_name;
        const quantity = saleDetail.quantity;
        if (productSales[productName]) {
          productSales[productName] += quantity;
        } else {
          productSales[productName] = quantity;
        }
      });
    });

    // Return the result
    res.status(200).json({ status: "success", data: productSales });

  } catch (error) {
    console.error("Error fetching product sales:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const lowStockProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: Image,
          as: "Images",
          where: { status: "1" }, // Only active images
          required: false,
          limit: 1, // Fetch only one image per product
        },
      ],
      order: [["stock", "ASC"]],
      limit: 6,
    });
    res.status(200).json({ status: "success", data: products });
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
  getSalesPerMonth,
  getProductSales,
  lowStockProducts
};
