import Utils from "@utils/Utils.js"

export const useDebounce = (callback, delay = 900) => {
  let timeout = null

  function debounced(...args) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      callback(...args)
    }, delay)
  }

  function clearDebounce() {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }
  debounced.cancel = clearDebounce
  return debounced
}

export const getMonthOfRage =(startDate, endDate)=> {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const result = [];

  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

  while (current <= endMonth) {
    const year = current.getFullYear();
    const month = current.getMonth() + 1;
    const lastDay = new Date(year, month, 0).getDate();

    const isFirstMonth = current.getFullYear() === start.getFullYear() &&
        current.getMonth() === start.getMonth();
    const isLastMonth = current.getFullYear() === end.getFullYear() &&
        current.getMonth() === end.getMonth();

    let fromDay;
    let toDay;

    if (isFirstMonth && isLastMonth) {
      fromDay = start.getDate();
      toDay = end.getDate();
    } else if (isFirstMonth) {
      fromDay = start.getDate();
      toDay = lastDay;
    } else if (isLastMonth) {
      fromDay = 1;
      toDay = end.getDate();
    } else {
      fromDay = 1;
      toDay = lastDay;
    }

    result.push({
      id: `${year}-${month}`,
      from: fromDay,
      to: toDay,
      month: Utils.getMonthNameById(month),
      year
    });

    current.setMonth(current.getMonth() + 1);
  }
  return result;
}

