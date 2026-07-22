export const getStatusColor = (status, category) => {
  const name = status.toLowerCase();

  if (name.includes("cancel")) {
    return "#8B4513";
  }

  if (name.includes("closed")) {
    return "#008000";
  }

  if (name.includes("resolved")) {
    return "#90EE90";
  }

  if (name.includes("done")) {
    return "#90EE90";
  }

  if (category === "In Progress") {
    return "#FF8C00";
  }

  if (name.includes("in review")) {
    return "#B5E61D";
  }

  if (category === "To Do") {
    return "#0052CC";
  }

  return "#A5ADBA";
};