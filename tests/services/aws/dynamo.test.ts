/* eslint-disable camelcase */
import { DynamoDB, config } from '../../mocks/AWS';

import { find_last_run_dynamo, update_dynamo } from '../../../src/services/aws/dynamo';

describe('test services/aws/dynamo find_last_run_dynamo', () => {
  it('should run AWS.config.update', async () => {
    expect(config.update).lastCalledWith({
      region: 'us-east-1',
    })
  });
  it('should read data correctly', async () => {
    const last_run = new Date().getTime();
    DynamoDB.promise.mockResolvedValueOnce({
      Items: [
        {
          rf_url: { S: 'demo.my.salesforce.com' },
          last_successful_run: { N: last_run.toString() },
        },
      ],
    });
    const actual = await find_last_run_dynamo('name');
    expect(DynamoDB.scan).toBeCalledWith({
      TableName: 'name',
    });
    expect(actual).toEqual(['demo.my.salesforce.com', last_run]);
  });
  it('should raise exception on data correctly', async () => {
    DynamoDB.promise.mockResolvedValueOnce({
      Items: [
        {
          rf_url: { S: 'demo.my.salesforce.com' },
          last_successful_run: {},
        },
      ],
    });
    try {
      await expect(find_last_run_dynamo('name')).toThrowError(Error);
    } catch (e) {
    }
  });
  it('should not raise exception on data correctly', async () => {
    const last_run = new Date().getTime();
    DynamoDB.promise.mockResolvedValueOnce({
      Items: []
    });
    const actual = await find_last_run_dynamo('name');
    expect(DynamoDB.scan).toBeCalledWith({
      TableName: 'name',
    });
    expect(actual).toEqual(['none', 0]);
  });
  it('should not raise exception on data correctly', async () => {
    const dynamo_db_scan = { scan: jest.fn().mockReturnThis(), promise: jest.fn() };
    dynamo_db_scan.promise.mockResolvedValueOnce({
      Items: []
    });
    const actual = await find_last_run_dynamo('name', dynamo_db_scan);
    expect(DynamoDB.scan).toBeCalledWith({
      TableName: 'name',
    });
    expect(actual).toEqual(['none', 0]);
  });
});

describe('test services/aws/dynamo update_dynamo', () => {
  it('should upload correctly', async () => {
    DynamoDB.promise.mockResolvedValueOnce('fake response');
    const last_run = new Date().getTime();
    const actual = await update_dynamo('name', last_run, 'demo.my.salesforce.com');
    expect(DynamoDB.updateItem).toBeCalledWith({
      TableName: 'name',
      Key: {
        rf_url: { S: 'demo.my.salesforce.com' },
        when_run: { N: '1488140498888' },
      },
      UpdateExpression: 'set last_successful_run = :x',
      ExpressionAttributeValues: {
        ':x': { N: last_run.toString() },
      },
    });
    expect(actual).toEqual(undefined);
  });
  it('should raise on upload correctly', async () => {
    DynamoDB.promise.mockResolvedValueOnce(jest.fn(() => { throw new Error(); }));
    try {
      const last_run = new Date().getTime();
      await expect(update_dynamo('name', last_run, 'demo.my.salesforce.com')).toThrow(Error);
    } catch (e) {
    }
  });
  it('should raise on upload correctly', async () => {
    const promise_mock = { promise: jest.fn(() => { throw new Error(); }) };
    const update_dynamo_mock = { updateItem: jest.fn(() => promise_mock) };
    try {
      const last_run = new Date().getTime();
      await expect(update_dynamo('name', last_run, 'demo.my.salesforce.com', update_dynamo_mock)).toThrow(Error);
    } catch (e) {
    }
  });
});
