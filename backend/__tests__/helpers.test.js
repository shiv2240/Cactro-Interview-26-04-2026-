const { calculateStatus } = require('../utils/helpers');

describe('Status Calculation Algorithm', () => {
  test('should return "planned" when there are no steps', () => {
    expect(calculateStatus([])).toBe('planned');
    expect(calculateStatus(null)).toBe('planned');
  });

  test('should return "planned" when steps exist but none are completed', () => {
    const steps = [
      { completed: false },
      { completed: false }
    ];
    expect(calculateStatus(steps)).toBe('planned');
  });

  test('should return "ongoing" when at least one step is completed', () => {
    const steps = [
      { completed: true },
      { completed: false },
      { completed: false }
    ];
    expect(calculateStatus(steps)).toBe('ongoing');
  });

  test('should return "done" when all steps are completed', () => {
    const steps = [
      { completed: true },
      { completed: true },
      { completed: true }
    ];
    expect(calculateStatus(steps)).toBe('done');
  });
});
