const allowedTransitions = {
  draft: ["published"],
  published: ["archived"],
  archived: [],
};

const validateTransition = (currentStatus, newStatus) => {
  if (!allowedTransitions[currentStatus]) return false;
  return allowedTransitions[currentStatus].includes(newStatus);
};

module.exports = { validateTransition };