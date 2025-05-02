const Category = require("../models/Category");
const Supplier = require("../models/Supplier");
const { Sequelize, Op } = require("sequelize"); // Import Sequelize operators

// ✅ Get all Supplier
const getAllSupplier = async (req, res) => {
  try {
    const { limit = 2000, offset = 0 } = req.query; // Default values

    const suppliers = await Supplier.findAll({
      limit: limit,
      offset: offset,
      attributes: {
        include: [
          [
            Sequelize.literal(
              `CASE WHEN status = '1' THEN 'aktif' WHEN status = '0' THEN 'non aktif' ELSE 'unknown' END`
            ),
            "status_info",
          ],
        ],
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Suppliers retrieved successfully",
      data: suppliers,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
      data: null,
    });
  }
};

// ✅ Get by ID
const getSupplierById = async (req, res) => {
  try {
    const { id } = req.query; // Get ID from query parameters
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const supplier = await Supplier.findByPk(id, {
      include: [
        {
          model: Category,
          required: false, // Products with or without images
        },
      ],
    });
    if (!supplier) {
      return res.status(404).json({
        status: "error",
        message: "Supplier not found",
        data: null,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Supplier retrieved successfully",
      data: supplier,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
      data: null,
    });
  }
};

// ✅ Create new
const createSupplier = async (req, res) => {
  try {
    // const { supplier_name, phone, id_category, address } = req.body;
    // retrieve data from json body
    const { supplier_name, phone, id_category, address } = req.body;
    // Check
    if (!supplier_name || !phone || !id_category) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields",
        data: null,
      });
    }

    // Create new
    const newSupplier = await Supplier.create({
      supplier_name: supplier_name,
      phone: phone,
      id_category: id_category,
      address: address,
      status: "1",
    });

    return res.status(201).json({
      status: "success",
      message: "Supplier created successfully",
      data: newSupplier,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
      data: null,
    });
  }
};

const editSupplier = async (req, res) => {
  const transaction = await Supplier.sequelize.transaction();

  try {
    const { id_supplier, supplier_name, id_category, phone, address, status } =
      req.body;

    if (!id_supplier || !supplier_name || !id_category || !status) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields",
        data: req.body,
      });
    }

    const existingSupplier = await Supplier.findByPk(id_supplier);
    if (!existingSupplier) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
        data: null,
      });
    }

    // ✅ Update the product
    await existingSupplier.update(
      {
        id_supplier,
        supplier_name,
        id_category,
        phone,
        address,
        status,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      status: "success",
      message: "Supplier edited successfully",
      data: existingSupplier,
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

// Export the controller functions
module.exports = {
  getAllSupplier,
  getSupplierById,
  createSupplier,
  editSupplier,
};
