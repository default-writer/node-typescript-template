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
      var str = result.Items[0].last_succesful_run.N; //TODO: this is spelled wrong change in dynamo!
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
          N: '1599251805804',
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

async function get_ams_commication_length(table_name, caseId, when_run, dynamo_db) {
  try {
    if (!dynamo_db) {
      dynamo_db = dynamodb;
    }
    var params = {
      TableName: table_name,
      AttributesToGet: ['communications_length'],
      Key: {
        rf_url: {
          S: caseId,
        },
        when_run: {
          N: when_run.toString(),
        },
      },
    };
    var data = await dynamo_db.getItem(params).promise();
    logger.debug('returned from getItem ' + JSON.stringify(data));
    if (Object.prototype.hasOwnProperty.call(data, 'Item'))
      //if(data.hasOwnProperty('Item'))
      return data.Item.communications_length.N;
    else return null;
  } catch (error) {
    logger.error(error);
    throw new Error(error);
  }
}

function update_ams_case_communications(table_name, caseId, communications_length, dynamo_db) {
  if (!dynamo_db) {
    dynamo_db = dynamodb;
  }
  const dynamodbParams = {
    TableName: table_name,
    Key: {
      rf_url: {
        S: caseId,
      },
      when_run: {
        N: '1',
      },
    },
    ConditionExpression: 'communications_length < :cl',
    UpdateExpression: 'SET communications_length = :cl',
    ExpressionAttributeValues: {
      ':cl': { N: communications_length.toString() },
    },
  };
  console.log(dynamodbParams);
  dynamo_db.updateItem(dynamodbParams, function (err, data) {
    if (err) {
      if (err.toString().startsWith('ConditionalCheckFailedException:')) {
        logger.info('caseId is not changed ignoring caseId');
      } else {
        console.log(err, err.stack);
      }
    } else {
      logger.info('caseId has new information. sync this to RF');
    }
  });
}

// var params = {
//   TableName: table_name,
//   Item: {
//     'rf_url': {
//       S: caseId,
//     },
//     'when_run': {
//       N: '1',
//     },
//     'communications_length' : {N: communications_length.toString()},
//     'caseId' : {S: caseId}
//   }
// };

// // Call DynamoDB to add the item to the table
// dynamo_db.putItem(params, function(err, data) {
//   if (err) {
//     console.log("Error", err);
//   } else {
//     console.log("Success", data);
//   }
// });
//}

//TODO: we need to know how to do updates from RF to see what is different
async function add_new_RF_Incident_and_AWS_case(table_name, rf_name, when_run, caseId, communications_length, dynamo_db) {
  try {
    if (!dynamo_db) {
      dynamo_db = dynamodb;
    }
    var params = {
      TableName: table_name,
      Item: {
        rf_url: {
          S: rf_name,
        },
        when_run: {
          N: when_run.toString(),
        },
        rf_name: { S: rf_name },
        caseId: { S: caseId },
        communications_length: { N: communications_length.toString() },
      },
    };
    //console.log(params);
    var data = dynamo_db.putItem(params).promise();
    return data;
  } catch (error) {
    logger.error(error + ' ' + error.stack);
    throw new Error(error);
  }
}

async function has_RF_case(table_name, rf_name, when_run, dynamo_db) {
  try {
    if (!dynamo_db) {
      dynamo_db = dynamodb;
    }
    var params = {
      TableName: table_name,
      AttributesToGet: ['rf_name', 'caseId', 'communications_length'],
      Key: {
        rf_url: {
          S: rf_name,
        },
        when_run: {
          N: when_run.toString(),
        },
      },
    };
    var data = await dynamo_db.getItem(params).promise();
    logger.silly('returned from getItem ' + JSON.stringify(data));
    if (Object.prototype.hasOwnProperty.call(data, 'Item')) return true;
    //if(data.hasOwnProperty('Item'))
    // return data.Item.rf_name.N;
    else return false;
  } catch (error) {
    logger.error(error);
    throw new Error(error);
  }
}

module.exports = {
  update_dynamo,
  find_last_run_dynamo,
  update_ams_case_communications,
  get_ams_commication_length,
  has_RF_case,
  add_new_RF_Incident_and_AWS_case,
};
