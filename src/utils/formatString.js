export function fCapitalizeFirst(text) {
  return (
    (text?.charAt(0)?.toUpperCase() ?? "") +
    (text?.slice(1)?.toLowerCase() ?? "")
  );
}

export function isValidEmail(email) {
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i;
  return emailRegex.test(email);
}

export function fGetNumber(text) {
  try {
    if (text) {
      return Number(text.replace(/[^0-9\.]+/g, ""));
    }
  } catch (error) {
    console.log("Error in fGetNumber : ", error);
  }

  return null;
}
