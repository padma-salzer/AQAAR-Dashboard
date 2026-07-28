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

   if (name.includes("client uat")) {
    return "#9C27B0";      // Purple
  }

  if (name.includes("internal qa")) {
    return "#2196F3";      // Blue
  }

  if (name.includes("waiting for customer")) {
    return "#E91E63";      // Pink
  }

  if (name.includes("in progress")) {
    return "#FF9800";      // Orange
  }

  //  if (category === "In Progress") {
  //   return "#FF8C00";
  // }
  if (category === "To Do") {
    return "#0052CC";
  }
 
  return "#A5ADBA";
};