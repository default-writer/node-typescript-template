/* eslint-disable unicorn/filename-case */
declare const _DynamoDB: {
  scan: any;
  updateItem: any;
  promise: any;
};

declare const _STS: {
  promise: any;
};

declare const _SQS: {
  receiveMessage: any;
  promise: any;
};

export { _DynamoDB, _STS, _SQS };
