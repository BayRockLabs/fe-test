const MAX_LENGTH = 15;
export const validateInput = (value) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "This field is required";
  }
  if (/^[0-9]+$/.test(trimmedValue)) {
    return "Input cannot be numeric-only";
  }
  if (!/^[a-zA-Z\s]+$/.test(trimmedValue)) {
    return "Input must contain only letters and spaces";
  }
  if (trimmedValue.length > MAX_LENGTH) {
    return `Input must be less than ${MAX_LENGTH} characters`;
  }

  return true;
};
