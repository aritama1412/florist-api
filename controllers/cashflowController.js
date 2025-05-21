const { Op } = require("sequelize");
const Kas = require("../models/Kas");
const Sale = require("../models/Sale");
const Purchase = require("../models/Purchase");

const getCashflow = async (req, res) => {
    try {
        // Fetch all records from the `Kas` table ordered by tanggal asc
        const kas = await Kas.findAll({
            order: [["tanggal", "ASC"]],
        });

        let balance = 0; // Initialize balance
        const processedData = kas.map((record) => {
            let income = 0;
            let cash_out = 0;

            // Calculate income and cash out based on type
            if (record.type === "in") {
                income = record.total;
                balance += income; // Add to balance
            } else if (record.type === "out") {
                cash_out = record.total;
                balance -= cash_out; // Subtract from balance
            }

            // Add income, cash_out, and balance to the record
            return {
                ...record.toJSON(),
                income,
                cash_out,
                balance,
            };
        });

        // Sort back to descending order for the final response
        const sortedData = processedData.sort((a, b) =>
            new Date(b.tanggal) - new Date(a.tanggal)
        );

        res.status(200).json({ status: "success", data: sortedData });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};



module.exports = {
    getCashflow,
};
