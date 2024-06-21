
export const getErrorMessage = (error: any) => {
  if (error?.response?.status === 429) {
    return "Too many requests! Please try again after a minute.";
  } else {
    return "Something went wrong!";
  }
};

export const getCurrentDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const getDate30DaysEarlier = () => {
  const today = new Date();
  const earlierDate = new Date(today);
  earlierDate.setDate(today.getDate() - 30);
  const yyyy = earlierDate.getFullYear();
  const mm = String(earlierDate.getMonth() + 1).padStart(2, "0");
  const dd = String(earlierDate.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const dateStringToUnix = (dateString: string) => {
  const date = new Date(dateString);
  return Math.floor(date.getTime() / 1000);
};

export const stringToColor = (str: string) => {
  for (
    var i = 0, hash = 0;
    i < str.length;
    hash = str.charCodeAt(i++) + ((hash << 5) - hash)
  );
  let color = Math.floor(
    Math.abs(((Math.sin(hash) * 10000) % 1) * 16777216)
  ).toString(16);
  return "#" + Array(6 - color.length + 1).join("0") + color;
};
