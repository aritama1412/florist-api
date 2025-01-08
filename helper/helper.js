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

module.exports = { getCurrentDate, getCurrentDateInv, getToday };
