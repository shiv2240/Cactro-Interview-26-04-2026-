const predefinedSteps = [
  "All relevant GitHub pull requests have been merged",
  "CHANGELOG.md files have been updated",
  "All tests are passing",
  "Releases in GitHub created",
  "Deployed in demo",
  "Tested thoroughly in demo",
  "Deployed in production"
];

const getPredefinedChecklist = () => {
  return predefinedSteps.map((step, index) => ({
    id: index + 1,
    name: step,
    completed: false
  }));
};

const calculateStatus = (steps) => {
  if (!steps || steps.length === 0) return 'planned';
  const completedCount = steps.filter(step => step.completed).length;
  if (completedCount === 0) return 'planned';
  if (completedCount === steps.length) return 'done';
  return 'ongoing';
};

module.exports = {
  getPredefinedChecklist,
  calculateStatus
};
