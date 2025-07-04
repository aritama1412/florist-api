const Product = require("../models/Product");
const { Sequelize, Op } = require("sequelize"); // Import Sequelize operators
const path = require("path");
const fs = require("fs");
const multer = require("multer");// Berhubungan dengan pengelolaan file upload
const Image = require("../models/Image"); // Your image model
const Category = require("../models/Category");

// ✅ Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // Example: 20241217
    const randomNumber = Math.floor(10000 + Math.random() * 90000); // Example: 54321
    const fileExtension = path.extname(file.originalname); // Example: .jpg, .png, etc.
    const newFileName = `${currentDate}_${randomNumber}${fileExtension}`; // Example: 2024121754321.jpg
    cb(null, newFileName);
  },
});

// Export the upload function to be used in the route
const upload = multer({ storage: storage });

// ✅ Get all products
const getAllProducts = async (req, res) => {
  try {
    const { limit = 20, offset = 0, category = 0 } = req.query;
    // Parse limit and offset as integers
    const parsedLimit = parseInt(limit) || 20; // Default to 20 items per page
    const parsedOffset = parseInt(offset) || 0; // Default to starting at 0
    const parsedCategory = parseInt(category) || 0; // Default to category 0
    // Handle category filtering
    const whereCondition =
      parsedCategory === 0
        ? { status: "1" } // Get all active products if category is 0
        : { id_category: parsedCategory, status: "1" }; // Filter by specific category
        console.log('whereCondition', whereCondition)

    // Fetch the total count of products
    const totalProducts = await Product.count({
      where: whereCondition,
    });

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalProducts / parsedLimit);

    // Fetch products with pagination and optional category filtering
    // order by product name asc and where status = 1
    const products = await Product.findAll({
      where: whereCondition,
      limit: parsedLimit,
      offset: parsedOffset,
      include: [
        {
          model: Image,
          where: { status: "1" }, // Only active images
          required: false, // Include products with or without images
        },
      ],
      order: [["product_name", "ASC"]], 
    });

    return res.status(200).json({
      status: "success",
      message: "Products retrieved successfully",
      data: {
        products,
        totalProducts,
        totalPages,
        currentPage: Math.floor(parsedOffset / parsedLimit) + 1,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
      data: null,
    });
  }
};


// ✅ Get all products
const getAllProductsAdmin = async (req, res) => {
  try {
    const { limit = 2000, offset = 0, categories } = req.query;

    if (!categories) {
      const limit = parseInt(req.query.limit) || 2000; // Default to 20 items
      const offset = parseInt(req.query.offset) || 0; // Default to 0 (start)

      // Fetch products with associated images
      const products = await Product.findAll({
        limit: limit,
        offset: offset,
        include: [
          {
            model: Image,
            // where: { status: "1" }, // Only active images
            required: false, // Products with or without images
          },
          {
            model: Category,
            required: false,
          },
        ],
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
        message: "Products retrieved successfully",
        data: products,
      });
    } else {
      const categoryIds = categories
        .split(",")
        .map((id) => parseInt(id))
        .filter((id) => !isNaN(id));

      const limit = parseInt(req.query.limit) || 20; // Default to 20 items
      const offset = parseInt(req.query.offset) || 0; // Default to 0 (start)

      const products = await Product.findAll({
        limit: limit,
        offset: offset,
        where: {
          id_category: {
            [Op.in]: categoryIds,
          },
        },
        include: [
          {
            model: Image,
            where: { status: "1" }, // Only active images
            required: false, // Products with or without images
          },
          {
            model: Category,
            required: false,
          },
        ],
      });

      return res.status(200).json({
        status: "success",
        message: "Products retrieved successfully",
        data: products,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
      data: null,
    });
  }
};

// ✅ Get product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.query; // Get ID from query parameters
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findByPk(id, {
      include: [
        {
          model: Image,
          where: { status: "1" }, // Only active images
          required: false, // Products with or without images
        },
        {
          model: Category,
          required: false, // Products with or without images
        },
      ],
    });
    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
        data: null,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Products retrieved successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
      data: null,
    });
  }
};

// ✅ Create a new product
const createProduct = async (req, res) => {
  const transaction = await Product.sequelize.transaction();

  try {
    const { product_name, id_category, id_supplier, price, stock, description, creator } =
      req.body;

    // Check for required fields
    if (!product_name || !id_category || !id_supplier || !price || !stock || !creator) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields",
        data: req.body,
      });
    }

    // ✅ Create a new product
    const newProduct = await Product.create(
      {
        product_name,
        id_category,
        id_supplier,
        price,
        stock,
        description,
        created_by: creator,
        status: "1",
      },
      { transaction } // Untukan transaction untuk rollback jika terjadi error
    );

    // ✅ Handle image uploads (only if images are provided)
    if (req.files && req.files.length > 0) {
      // Limit images to a maximum of 5
      const imagesData = req.files.slice(0, 5).map((file) => ({
        id_product: newProduct.id_product,
        image: `/uploads/${file.filename}`,
        status: "1",
      }));

      // ✅ Save images in the database
      await Image.bulkCreate(imagesData, { transaction });
      newProduct.images = imagesData; // Attach image data to the product response
    }

    await transaction.commit();

    return res.status(201).json({
      status: "success",
      message: "Product created successfully",
      data: newProduct,
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

const editProduct = async (req, res) => {
  const transaction = await Product.sequelize.transaction();

  try {
    const {
      id_product,
      product_name,
      id_category,
      price,
      description,
      editor,
      status,
    } = req.body;

    if (
      !id_product ||
      !product_name ||
      !id_category ||
      !price ||
      !editor ||
      !status
    ) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields",
        data: req.body,
      });
    }

    const existingProduct = await Product.findByPk(id_product);
    if (!existingProduct) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
        data: null,
      });
    }

    // ✅ Update the product
    await existingProduct.update(
      {
        product_name,
        id_category,
        price,
        description,
        updated_by: editor,
        updated_at: new Date(),
        status: status,
      },
      { transaction }
    );

    // ✅ Handle image uploads (only if images are provided)
    if (req.files && req.files.length > 0) {
      // Limit images to a maximum of 5
      const imagesData = req.files.slice(0, 5).map((file) => ({
        id_product: existingProduct.id_product,
        image: `/uploads/${file.filename}`,
        status: "1",
      }));

      // ✅ Save images in the database
      await Image.bulkCreate(imagesData, { transaction });
      existingProduct.images = imagesData; // Attach image data to the product response
    }

    await transaction.commit();

    return res.status(201).json({
      status: "success",
      message: "Product created successfully",
      data: existingProduct,
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

const deleteProduct = async (req, res) => {
  const transaction = await Product.sequelize.transaction();

  try {
    const {id_product} = req.body;

    if (
      !id_product) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields",
        data: req.body,
      });
    }

    const existingProduct = await Product.findByPk(id_product);
    if (!existingProduct) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
        data: null,
      });
    }

    // ✅ Update the product
    await existingProduct.update(
      {
        status: '0',
        updated_by: 1,
        updated_at: new Date(),
      },
      { transaction }
    );

    await transaction.commit();
    
    return res.status(201).json({
      status: "success",
      message: "Product deleted successfully",
      data: existingProduct,
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

// ✅ Get all products
const getLowStock = async (req, res) => {
  try {
    const { limit = 2000, offset = 0, categories } = req.query;

    // const limit = parseInt(req.query.limit) || 2000; // Default to 20 items
    // const offset = parseInt(req.query.offset) || 0; // Default to 0 (start)

    // Fetch products with associated images
    // select only  ["id_product", "product_name", "price", "stock"], from 

    const products = await Product.findAll({
      limit: limit,
      offset: offset,
      attributes: ["id_product", "product_name", "price", "stock", "status"],
      where: {
        stock: {
          [Op.lte]: 3,
        },
        status: "1",
      },

    });

    return res.status(200).json({
      status: "success",
      message: "Products retrieved successfully",
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
      data: null,
    });
  }
};

const deleteImage = async (req, res) => {
  const transaction = await Image.sequelize.transaction();

  try {
    const { id_image } = req.body;

    if (!id_image) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields",
        data: req.body,
      });
    }

    // Get image record from DB
    const existingImage = await Image.findByPk(id_image);
    if (!existingImage) {
      return res.status(404).json({
        status: "error",
        message: "Image not found",
        data: null,
      });
    }

    // OPTIONAL: delete from DB
    await Image.destroy({
      where: { id_image },
      transaction
    });
    await transaction.commit();

    // Safe file deletion
    const imgPath = existingImage.image.startsWith('/')
      ? existingImage.image.slice(1)
      : existingImage.image;

    if (fs.existsSync(imgPath)) {
      fs.unlinkSync(imgPath);
    }

    return res.status(200).json({
      status: "success",
      message: "Image deleted successfully",
      data: null,
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
  createProduct,
  upload,
  getAllProducts,
  getAllProductsAdmin,
  getProductById,
  createProduct,
  editProduct,
  deleteProduct,
  getLowStock,
  deleteImage,
};
