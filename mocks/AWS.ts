/* eslint-disable unicorn/filename-case */
const DynamoDB = {
  scan: jest.fn().mockReturnThis(),
  updateItem: jest.fn().mockReturnThis(),
  promise: jest.fn(),
};

const STS = {
  promise: jest.fn(),
};

const SQS = {
  receiveMessage: jest.fn().mockReturnThis(),
  promise: jest.fn(),
};

const config = {
  update: jest.fn().mockReturnThis(),
};

jest.mock('aws-sdk', () => {
  return {
    DynamoDB: jest.fn(() => DynamoDB),
    STS: jest.fn(() => STS),
    SQS: jest.fn(() => SQS),
    config: config
  };
});

export { DynamoDB, STS, SQS, config };
