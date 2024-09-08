const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

module.exports = {
  addEventListener: mockAddEventListener,
  removeEventListener: mockRemoveEventListener,
  // Include any other methods your component uses
};
