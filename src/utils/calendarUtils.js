import {
  addDays,
  eachDayOfInterval,
  format,
  getISOWeek,
  isSaturday,
  isSunday,
  isWeekend,
} from "date-fns";
import { MONTH_LABELS } from "./constants";

export const getDatesByWeekNumber = (hoursByDate, year, month, weekNumber) => {
  const dates = [];

  for (const entry of hoursByDate) {
    if (
      entry.year === year &&
      entry.week === weekNumber &&
      entry.month === month
    ) {
      const dayOfWeek = new Date(entry.fullDate).getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push(entry.fullDate);
      }
    }
  }

  return dates;
};

export const getDatesByMonthAndYear = (hoursByDate, year, month) => {
  if (!Array.isArray(hoursByDate)) {
    console.error("Error: hoursByDate must be an array.");
    return [];
  }

  const dates = [];
  for (const entry of hoursByDate) {
    if (entry.year === year && entry.month === month) {
      const currentDate = new Date(entry.fullDate);
      const dayOfWeek = currentDate.getDay();

      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push(entry.fullDate);
      }
    }
  }

  return dates;
};

export const distributeHoursEqually = (totalHours, totalDays, checkboxtype) => {
  let MainHours = 8;
  if (checkboxtype === "halftime") MainHours = 4;
  else if (checkboxtype === "25percent") MainHours = 2;
  else if (checkboxtype === "75percent") MainHours = 6;
  const maxHoursPerDay = MainHours;
  let distributedHours = Array(totalDays).fill(0);

  if (totalHours <= maxHoursPerDay * totalDays) {
    // Distribute maximum hours to each day
    for (let i = 0; i < totalDays; i++) {
      if (totalHours >= maxHoursPerDay) {
        distributedHours[i] = maxHoursPerDay;
        totalHours -= maxHoursPerDay;
      } else {
        distributedHours[i] = totalHours;
        break;
      }
    }
  } else {
    const hoursPerDay = Math.floor(totalHours / totalDays);
    for (let i = 0; i < totalDays; i++) {
      distributedHours[i] = hoursPerDay;
    }
    let remainingHours = totalHours - hoursPerDay * totalDays;
    for (let i = 0; i < totalDays; i++) {
      if (remainingHours > 0 && distributedHours[i] < maxHoursPerDay) {
        distributedHours[i]++;
        remainingHours--;
      }
    }
  }

  return distributedHours;
};

export function distributeHours(totalHours, totalDays, minHours, maxHours) {
  if (totalHours < totalDays * minHours || totalHours > totalDays * maxHours) {
    // Total hours cannot be distributed within the given constraints
    return null;
  }

  // Create an array to store the distributed hours per day
  const distributedHours = new Array(totalDays).fill(minHours);

  // Calculate the initial total distributed hours
  let currentTotal = totalDays * minHours;

  // Distribute the remaining hours while staying within maxHours limit
  for (let i = 0; i < totalDays; i++) {
    while (currentTotal < totalHours && distributedHours[i] < maxHours) {
      distributedHours[i]++;
      currentTotal++;
    }
  }

  return distributedHours;
}

export const calculateTotalWorkingHours = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  let currentDate = start;
  let totalHours = 0;

  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Exclude weekends (Sunday and Saturday)
      totalHours += 8; // Add 8 hours for each working day
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return totalHours;
};

export const getHoursWithoutWeekends = (startDate, endDate) => {
  if (!(startDate instanceof Date)) {
    startDate = new Date(startDate);
  }
  if (!(endDate instanceof Date)) {
    endDate = new Date(endDate);
  }

  startDate.setHours(0, 0, 0, 0); // Set to the start of the day
  endDate.setHours(23, 59, 59, 999); // Set to the end of the day

  const weekdays = calculateDaysWithoutWeekends(startDate, endDate);

  return weekdays * 8;
};

export const calculateDaysWithoutWeekends = (startDate, endDate) => {
  let currentDate = startDate;
  let totalDays = 0;
  let weekendDays = 0;

  while (currentDate <= endDate) {
    totalDays++;

    if (isWeekend(currentDate)) {
      weekendDays++;
    }

    currentDate = addDays(currentDate, 1);
  }

  const weekdays = totalDays - weekendDays;

  return weekdays;
};

export const generateCalendarDays = (
  year,
  month,
  selectedStartDate,
  selectedEndDate
) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay();

  const calendarDays = [];
  let currentRow = [];

  const totalDays =
    daysInMonth + startDay + (7 - ((daysInMonth + startDay) % 7));

  for (let i = 1; i <= totalDays; i++) {
    const date = new Date(year, month, i - startDay);
    const dayNumber = date.getDate();
    const dayOfWeek = date.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
    const isToday = date.toDateString() === new Date().toDateString();
    const isPreviousMonth = i <= startDay;
    const isNextMonth = i > daysInMonth + startDay;

    // Disable Saturdays (6) and Sundays (0)
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isDisabled =
      (selectedStartDate && date < selectedStartDate) ||
      (selectedEndDate && date > selectedEndDate);
    currentRow.push({
      dayNumber,
      date,
      isToday,
      isPreviousMonth,
      isNextMonth,
      isWeekend,
      isDisabled,
    });

    if (i % 7 === 0) {
      calendarDays.push(currentRow);
      currentRow = [];
    }
  }
  return calendarDays;
};

export const getWeekNumber = (date) => {
  const oneJan = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date - oneJan) / 86400000 + oneJan.getDay() + 1) / 7);
};

export const calculateWorkingWeeks = (start, end) => {
  let workingWeeks = [];
  let date = new Date(start);
  const endDate = new Date(end); // Use 'const' as it doesn't need modification

  while (date <= endDate) {
    const weekStartDate = new Date(date); // Use 'const' as it doesn't need modification
    const weekEndDate = new Date(date); // Use 'const' as it doesn't need modification
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    const weekNumber = getWeekNumber(weekStartDate); // Use 'const' as it doesn't need modification

    workingWeeks.push({
      start: weekStartDate,
      end: weekEndDate,
      number: weekNumber,
    });

    // Create a new Date object for the next iteration
    date = new Date(date);
    date.setDate(date.getDate() + 7);
  }

  return workingWeeks;
};

export const calculateWeekwiseDays = (
  startDate,
  endDate,
  selectedMonth,
  hoursByDate
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let currentDate = new Date(start);
  const weekwiseCounts = [];

  while (currentDate <= end) {
    const dateString = currentDate.toLocaleString().split(",")[0];
    if (
      currentDate.getDay() !== 0 &&
      currentDate.getDay() !== 6 &&
      currentDate.getMonth() === selectedMonth.getMonth()
    ) {
      const weekNumber = getWeekNumber(currentDate);

      if (!weekwiseCounts[weekNumber]) {
        weekwiseCounts[weekNumber] = 0;
      }
      if (hoursByDate?.length > 0) {
        let hoursObj = hoursByDate?.find((x) => x.fullDate == dateString);
        weekwiseCounts[weekNumber] += hoursObj
          ? hoursObj.hours !== ""
            ? hoursObj.hours
            : 0
          : 0;
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }
  return weekwiseCounts;
};

export const calculateTotalHoursByMonth = (month, year, hoursByDate) => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  let totalHours = 0;

  let currentDate = startDate;
  while (currentDate <= endDate) {
    const dateString = currentDate.toLocaleString().split(",")[0];
    let hoursObj = hoursByDate?.find((x) => x.fullDate == dateString); // Use 0 if no hours available for the date
    totalHours += hoursObj ? (hoursObj.hours !== "" ? hoursObj.hours : 0) : 0;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return totalHours;
};

// Function to calculate the working days within a specific month and range
export const calculateWorkingDaysInRange = (
  month,
  year,
  startDate,
  endDate
) => {
  const totalDays = new Date(year, month + 1, 0).getDate();
  let workingDays = 0;

  for (let day = 1; day <= totalDays; day++) {
    const currentDate = new Date(year, month, day);
    if (
      currentDate.getDay() !== 0 &&
      currentDate.getDay() !== 6 &&
      currentDate >= startDate &&
      currentDate <= endDate
    ) {
      workingDays++;
    }
  }
  return workingDays;
};

export const getWeekWorkingHours = (
  year,
  weekNumber,
  startDate,
  endDate,
  selectedMonth,
  checkboxtype
) => {
  // Ensure inputs are valid Date objects
  startDate = startDate instanceof Date ? startDate : new Date(startDate);
  endDate = endDate instanceof Date ? endDate : new Date(endDate);

  // Check for invalid dates
  if (isNaN(startDate) || isNaN(endDate)) {
    console.error("Invalid startDate or endDate provided:", startDate, endDate);
    return 0; // Return 0 hours for invalid inputs
  }

  const daysPerWeek = 7;
  const oneJan = new Date(year, 0, 1);

  const firstWeekStart = new Date(
    oneJan.getTime() +
      ((weekNumber - 1) * daysPerWeek - oneJan.getDay() + 1) * 86400000
  );
  let workingHours = 0;

  let MainHours = 8;
  if (checkboxtype === "halftime") MainHours = 4;
  else if (checkboxtype === "25percent") MainHours = 2;
  else if (checkboxtype === "75percent") MainHours = 6;
  for (let i = 0; i < daysPerWeek; i++) {
    const currentDate = new Date(firstWeekStart);
    currentDate.setDate(currentDate.getDate() + i);

    const currentDateWithoutTime = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    const startDateWithoutTime = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );
    const endDateWithoutTime = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate()
    );

    if (
      currentDateWithoutTime >= startDateWithoutTime &&
      currentDateWithoutTime <= endDateWithoutTime &&
      selectedMonth == currentDate.getMonth()
    ) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingHours += MainHours; // Assuming 8 hours per working day
      }
    }
  }

  return workingHours;
};

export const getMonthWorkingHours = (
  year,
  month,
  startDate,
  endDate,
  checkboxtype
) => {
  // Ensure startDate and endDate are valid Date objects
  const validStartDate =
    startDate instanceof Date ? startDate : new Date(startDate);
  const validEndDate = endDate instanceof Date ? endDate : new Date(endDate);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let workingHours = 0;

  let MainHours = 8;
  if (checkboxtype === "halftime") MainHours = 4;
  else if (checkboxtype === "25percent") MainHours = 2;
  else if (checkboxtype === "75percent") MainHours = 6;
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    const currentDateWithoutTime = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    const startDateWithoutTime = new Date(
      validStartDate.getFullYear(),
      validStartDate.getMonth(),
      validStartDate.getDate()
    );
    const endDateWithoutTime = new Date(
      validEndDate.getFullYear(),
      validEndDate.getMonth(),
      validEndDate.getDate()
    );

    if (
      currentDateWithoutTime >= startDateWithoutTime &&
      currentDateWithoutTime <= endDateWithoutTime
    ) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingHours += MainHours; // Assuming 8 hours per working day
      }
    }
  }

  return workingHours;
};

export function formatHours(hour) {
  return `${hour.toString().padStart(2, "0")}:00`;
}

export function convertToHour(formattedTime) {
  const parts = formattedTime.split(":");
  const hour = parseInt(parts[0], 10);
  return hour;
}
export const calculateTotalHours = (data) =>
  data.reduce((total, item) => total + item.hours, 0);

export const updateHoursByDate = (
  isMonthlyView,
  obj,
  newValue,
  hoursByDate,
  checkboxtype
) => {
  if (!Array.isArray(hoursByDate)) {
    console.error("Error: hoursByDate must be an array.");
    return null;
  }

  let rangeDates = [];
  if (isMonthlyView) {
    rangeDates = getDatesByMonthAndYear(hoursByDate, obj.year, obj.month);
  } else {
    rangeDates = getDatesByWeekNumber(
      hoursByDate,
      obj.year,
      obj.month,
      obj.number
    );
  }

  const updatedHoursByDate = [...hoursByDate];
  const workingDays = rangeDates.reduce((count, date) => {
    const currentDate = new Date(date);
    const dayOfWeek = currentDate.getDay();
    return count + (dayOfWeek !== 0 && dayOfWeek !== 6 ? 1 : 0);
  }, 0);

  let distributedHours = [];
  if (obj.isDay) {
    distributedHours = distributeHours(
      newValue,
      workingDays,
      obj.minHours,
      obj.maxHours
    );
  } else {
    distributedHours = distributeHoursEqually(
      newValue,
      workingDays,
      checkboxtype
    );
  }

  if (distributedHours == null) {
    return null;
  }

  rangeDates.forEach((date, index) => {
    if (index < distributedHours.length) {
      const entryIndex = updatedHoursByDate.findIndex(
        (entry) => entry.fullDate === date.toLocaleString().split(",")[0]
      );
      if (entryIndex !== -1) {
        updatedHoursByDate[entryIndex].hours = distributedHours[index];
      }
    }
  });

  return updatedHoursByDate;
};

export function distributeHoursWithLimitsAndMinMax(
  totalHours,
  limitsPerWeek,
  minHours,
  maxHours,
  setErrorMessage
) {
  const numberOfWeeks = limitsPerWeek.length;
  const distributedHours = Array(numberOfWeeks).fill(minHours);
  const minTotalHours = minHours * numberOfWeeks;
  const maxTotalHours = limitsPerWeek.reduce((acc, weekLimit) => {
    return acc + Math.min(weekLimit, maxHours);
  }, 0);

  // Check if the total hours are within the allowable range
  if (totalHours < minTotalHours || totalHours > maxTotalHours) {
    setErrorMessage(); // Call the error message function here
    return null;
  }
  setErrorMessage(true);
  let remainingHours = totalHours - minHours * numberOfWeeks;

  for (let i = 0; i < numberOfWeeks; i++) {
    const weekLimit = limitsPerWeek[i];
    const maxDistributableHours = Math.min(
      weekLimit - minHours,
      maxHours - minHours
    );

    if (remainingHours <= 0) {
      break; // All desired hours have been distributed.
    }

    const hoursToAdd = Math.min(maxDistributableHours, remainingHours);
    distributedHours[i] += hoursToAdd;
    remainingHours -= hoursToAdd;
  }

  return distributedHours;
}

export const generateInitialHoursByDate = (
  selectedStartDate,
  selectedEndDate,
  isChecked,
  hoursByDate,
  checkboxtype
) => {
  let initialHoursByDate = [];
  let MainHours = 8;
  if (checkboxtype === "halftime") MainHours = 4;
  else if (checkboxtype === "25percent") MainHours = 2;
  else if (checkboxtype === "75percent") MainHours = 6;
  if (hoursByDate?.length === 0 || isChecked) {
    let currentDate = new Date(selectedStartDate);

    while (currentDate <= selectedEndDate) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1; // Months are zero-based, so adding 1
      const week = getWeekNumber(currentDate);
      const date = currentDate.getDate();
      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const hours = isChecked && !isWeekend ? MainHours : 0;

      let currentDateObj = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      );

      initialHoursByDate.push({
        year,
        month,
        week,
        date,
        hours,
        hoursLabel: formatHours(hours),
        fullDate: currentDateObj.toLocaleString().split(",")[0],
      });

      currentDate.setDate(currentDateObj.getDate() + 1);
    }
  } else {
    initialHoursByDate = hoursByDate;
  }

  return initialHoursByDate;
};

export const generateDataForWeeks = (
  weekwiseData,
  currentMonth,
  selectedStartDate,
  selectedEndDate,
  checkboxtype
) => {
  const keys = Object.keys(weekwiseData);
  const keyValuePairs = keys.map((key, index) => ({
    number: Number(key),
    month: currentMonth.getMonth() + 1,
    year: currentMonth.getFullYear(),
    label: "W " + (index + 1),
    weekLabel: "Week" + (index + 1),
    hours: weekwiseData[key],
    maxHours: getWeekWorkingHours(
      currentMonth.getFullYear(),
      key,
      selectedStartDate,
      selectedEndDate,
      currentMonth.getMonth(),
      checkboxtype
    ),
  }));

  return keyValuePairs;
};

export const generateMonthlyLabels = (
  selectedStartDate,
  selectedEndDate,
  specifiedYear,
  hoursByDate,
  checkboxtype
) => {
  const start = new Date(selectedStartDate);
  const end = new Date(selectedEndDate);

  const months = [];
  const currentYear = specifiedYear.getFullYear();
  let currentMonth = 0; // Starting from January
  let totalHours = 0; // Initialize total hours

  while (currentMonth <= 11) {
    // Loop through all months
    const monthStartDate = new Date(currentYear, currentMonth, 1);
    const monthEndDate = new Date(currentYear, currentMonth + 1, 0);

    if (
      (start <= monthEndDate && start >= monthStartDate) ||
      (end >= monthStartDate && end <= monthEndDate) ||
      (start <= monthStartDate && end >= monthEndDate)
    ) {
      const totalHoursMonth = calculateTotalHoursByMonth(
        currentMonth,
        currentYear,
        hoursByDate
      );
      months.push({
        month: currentMonth + 1,
        year: currentYear,
        label: MONTH_LABELS[currentMonth],
        hours: totalHoursMonth !== 0 ? totalHoursMonth : "",
        maxHours: getMonthWorkingHours(
          currentYear,
          currentMonth,
          selectedStartDate,
          selectedEndDate,
          checkboxtype
        ),
      });

      totalHours += totalHoursMonth; // Add monthly hours to total hours
    }

    currentMonth++;
  }

  return {
    totalHours,
    months,
  };
};

export const calculateTotalEstimatedHours = (hoursByDate) => {
  const totalEstimatedHours = hoursByDate?.reduce((total, entry) => {
    return total + (entry.hours !== "" ? entry.hours : 0);
  }, 0);

  return totalEstimatedHours;
};

export const calculateWorkingDays = (weekDates) => {
  const workingDays = weekDates.reduce((count, date) => {
    const currentDate = new Date(date);
    const dayOfWeek = currentDate.getDay();
    return count + (dayOfWeek !== 0 && dayOfWeek !== 6 ? 1 : 0);
  }, 0);

  return workingDays;
};

export const updatedHours = (hoursByDate, weekDates, distributedHours) => {
  const updatedHoursByDate = [...hoursByDate];
  weekDates.forEach((date, index) => {
    if (index < distributedHours.length) {
      const entryIndex = updatedHoursByDate.findIndex(
        (entry) => entry.fullDate === date.toLocaleString().split(",")[0]
      );
      if (entryIndex !== -1) {
        updatedHoursByDate[entryIndex].hours = distributedHours[index];
      }
    }
  });

  return updatedHoursByDate;
};

export const calculateMarks = (isMonthlyView, checkboxtype) => {
  let MainHours = 8;
  if (checkboxtype === "halftime") MainHours = 4;
  else if (checkboxtype === "25percent") MainHours = 2;
  else if (checkboxtype === "75percent") MainHours = 6;
  const maxSliderValue = isMonthlyView ? 40 : MainHours; // Update maxSliderValue based on isMonthlyView
  const totalLimit = isMonthlyView ? 200 : 40; // Update total limit based on isMonthlyView

  const marks = Array.from({ length: maxSliderValue + 1 }, (_, i) => ({
    value: (100 / (isMonthlyView ? 2.5 : 12.5)) * i,
    label: `${(totalLimit / 5) * i}`,
  }));

  return marks;
};

export function generateTimeData(
  selectedStartDate,
  selectedEndDate,
  isFullTimeChecked,
  isHalfTimeChecked,
  is25PercentTimeChecked,
  is75PercentTimeChecked
) {
  if (!selectedStartDate || !selectedEndDate) {
    console.error("Missing start or end date");
    return { daily: [], weekly: [], monthly: [] };
  }

  const start = new Date(selectedStartDate);
  const end = new Date(selectedEndDate);

  if (isNaN(start) || isNaN(end)) {
    console.error("Invalid date format", { start, end });
    return { daily: [], weekly: [], monthly: [] };
  }

  if (start > end) {
    console.error("Start date is after End date", { start, end });
    return { daily: [], weekly: [], monthly: [] };
  }

  if (
    !isFullTimeChecked &&
    !isHalfTimeChecked &&
    !is25PercentTimeChecked &&
    !is75PercentTimeChecked
  ) {
    console.error("No time checkbox is selected");
    return { daily: [], weekly: [], monthly: [] };
  }

  let MainHours = 8;
  if (isHalfTimeChecked) MainHours = 4;
  else if (is25PercentTimeChecked) MainHours = 2;
  else if (is75PercentTimeChecked) MainHours = 6;

  const dailyHours = MainHours;
  const daily = [];
  const weekly = {};
  const monthly = {};

  try {
    eachDayOfInterval({ start, end }).forEach((date) => {
      if (isSaturday(date) || isSunday(date)) return;

      const formattedDate = format(date, "dd/MM/yyyy");
      daily.push({ date: formattedDate, hours: dailyHours });

      const weekKey = `${getISOWeek(date)}, ${format(date, "yyyy")}`;
      weekly[weekKey] = (weekly[weekKey] || 0) + dailyHours;

      const monthKey = `${format(date, "MM")}, ${format(date, "yyyy")}`;
      monthly[monthKey] = (monthly[monthKey] || 0) + dailyHours;
    });
  } catch (error) {
    console.error("Error during date iteration", error);
    return { daily: [], weekly: [], monthly: [] };
  }

  const weeklyData = Object.keys(weekly).map((week) => ({
    week,
    hours: weekly[week],
  }));

  const monthlyData = Object.keys(monthly).map((month) => ({
    month,
    hours: monthly[month],
  }));

  return { daily, weekly: weeklyData, monthly: monthlyData };
}
