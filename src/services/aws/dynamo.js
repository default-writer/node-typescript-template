/* eslint-disable camelcase */
var AWS = require('aws-sdk');
if (AWS.config) {
  AWS.config.update({
    region: 'us-east-1',
  });
}
var logger = require('../../config/logger.js');

var dynamodb = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
});

async function find_last_run_dynamo(table_name, dynamo_db) {
  try {
    if (!dynamo_db) {
      dynamo_db = dynamodb;
    }
    var params = {
      TableName: table_name,
    };
    var last_successful_run;
    var rf_url_result;
    var result = await dynamo_db.scan(params).promise();
    if (result.Items && result.Items.length > 0) {
      rf_url_result = result.Items[0].rf_url.S;
      logger.info('find_last_run_dynamo table ' + rf_url_result);
      logger.silly(JSON.stringify(result));
      //logger.silly(result.Items[0].last_successful_run);
      //logger.silly(result.Items[0].last_successful_run.N);
      var str = result.Items[0].last_successful_run.N; //TODO: this is spelled wrong change in dynamo!
      if (str) {
        //logger.silly(str)
        last_successful_run = Number.parseInt(str);
        logger.info('last_successful_run ' + last_successful_run);
        logger.debug(JSON.stringify(result));
      } else {
        logger.error('something weird with format???');
        throw new Error('bad result?');
      }
    } else {
      rf_url_result = 'none';
      logger.info('find_last_run_dynamo table ' + rf_url_result);
      last_successful_run = 0;
      logger.info('last_successful_run ' + last_successful_run);
      logger.debug(JSON.stringify(result));
    }
  } catch (error) {
    logger.error(error + ' ' + error.stack_trace);
    throw new Error(error);
  }

  return [rf_url_result, last_successful_run];
}

async function update_dynamo(table_name, last_run, url_instance, dynamo_db) {
  try {
    if (!dynamo_db) {
      dynamo_db = dynamodb;
    }
    var params = {
      TableName: table_name,
      Key: {
        rf_url: {
          S: url_instance,
        },
        when_run: {
          N: '1488140498888',
        },
      },
      UpdateExpression: 'set last_successful_run = :x',
      ExpressionAttributeValues: {
        ':x': {
          N: last_run.toString(),
        },
      },
    };
    var result = await dynamo_db.updateItem(params).promise();
    logger.info('update_dynamo result ' + JSON.stringify(result));
  } catch (error) {
    logger.error(error);
    throw new Error(error);
  }
}

module.exports = {
  find_last_run_dynamo,
  update_dynamo,
};
