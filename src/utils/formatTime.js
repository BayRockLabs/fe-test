import { format, formatDistanceToNow, addDays, isWeekend } from "date-fns";
import { MONTH_LABELS } from "./constants";

// ----------------------------------------------------------------------

export function fDateToISOString(date) {
  return new Date(date).toISOString();
}

export function fCurrentDate() {
  return fDateMDY(new Date());
}

export function fDate(date) {
  return format(new Date(date), "dd MMMM yyyy");
}

export function fDateMDY(date) {
  return format(new Date(date), "yyyy-MM-dd");
}

export function fDateDMY(date) {
  if (!date) return "";
  return format(new Date(date), "dd/MM/yyyy");
}

export function fDateYMD(date) {
  return format(new Date(date), "yyyy-MM-dd");
}

export function fDateTime(date) {
  return format(new Date(date), "dd MMM yyyy HH:mm");
}

export function fDateTimeMill(date) {
  return format(new Date(date), "yyyy-MM-dd");
}

export function fDateTimeSuffix(date) {
  return format(new Date(date), "dd/MM/yyyy hh:mm p");
}

export function fToNow(date) {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
  });
}

export const getDatePlusOne = (date) => {
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};

//convert DD/MM/YYYY took this type of input [{date: '10/1/2024', hours: 8}, {date: '10/2/2024', hours: 8}]
export const converDateToDDMMYYY = (arr) => {
  if (!Array.isArray(arr)) {
    console.error("Invalid data passed to converDateToDDMMYYY:", arr);
    return [];
  }
  return arr.map((item) => {
    const date = new Date(item.date);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    return {
      date: formattedDate,
      hours: item.hours,
    };
  });
};

export const NumberTypeChecker = (datatocheck) => {
  if (datatocheck && Array.isArray(datatocheck)) {
    return datatocheck.length;
  } else if (datatocheck && typeof datatocheck === Number) {
    return datatocheck;
  } else {
    return datatocheck;
  }
};

export const formatDateToyyMMDD = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};
