const getToday = () => {
  const today = new Date().toISOString().split("T")[0]; // '2024-12-28'

  return today;
};

const getCurrentDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getCurrentDateInv = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
};

// helpers.js
const getDateRange = (month, year) => {
  const startDate = new Date(year, month - 1, 1); // Start of the month
  const endDate = new Date(year, month, 0); // End of the month
  return {
    createdAt: {
      [Op.gte]: startDate,
      [Op.lte]: endDate,
    },
  };
};

module.exports = { getDateRange };


module.exports = { getCurrentDate, getCurrentDateInv, getToday, getDateRange };
