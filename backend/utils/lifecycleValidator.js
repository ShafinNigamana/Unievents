export const validateTransition = (currentStatus, newStatus) => {
  const allowedTransitions = {
    draft: ["published"],
    published: ["archived"],
    archived: [],
  };

  if (!allowedTransitions[currentStatus].includes(newStatus)) {
    return false;
  }

  return true;
};