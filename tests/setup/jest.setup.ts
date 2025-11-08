// @ts-nocheck

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: async () => ({}),
    })
  );
});

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});


