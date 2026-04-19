const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateSignupInput = ({ name, email, age, password }) => {
  const parsedAge = Number(age);

  if (!name?.trim()) {
    return "Name is required.";
  }

  if (!emailRegex.test(email || "")) {
    return "A valid email address is required.";
  }

  if (!Number.isInteger(parsedAge) || parsedAge < 13 || parsedAge > 120) {
    return "Age must be a whole number between 13 and 120.";
  }

  if (!password || password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  return null;
};

export const validateLoginInput = ({ email, password }) => {
  if (!emailRegex.test(email || "")) {
    return "A valid email address is required.";
  }

  if (!password) {
    return "Password is required.";
  }

  return null;
};

export const validateTransactionInput = ({
  amount,
  type,
  category,
  date,
  description
}) => {
  const parsedAmount = Number(amount);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return "Amount must be a number greater than zero.";
  }

  if (!["income", "expense"].includes(type)) {
    return "Transaction type must be income or expense.";
  }

  if (!category?.trim()) {
    return "Category is required.";
  }

  if (!date || Number.isNaN(new Date(date).getTime())) {
    return "A valid transaction date is required.";
  }

  if (description && description.length > 180) {
    return "Description must be 180 characters or fewer.";
  }

  return null;
};
