"use strict";
var AWS = require("aws-sdk");
var uuid = require("uuid");
const middy = require('middy')
const { cors } = require('middy/middlewares')

const hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Go Serverless v1.0! Your function executed successfully!",
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

const submit = async (event, context) => {

  let submission = {};

  try {
    const formData = JSON.parse(event.body);
    const newId = uuid.v4();

    submission = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      title: formData.title,
      notes: formData.notes,
      email: formData.email,
      id: newId,
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 400,
      body: JSON.stringify(e),
    };
  }

  try {
    const docClient = new AWS.DynamoDB.DocumentClient();
    const response = await docClient.put({
      TableName: "submissions",
      Item: submission,
    }).promise();
    console.log("Dynamo response", response);
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify(e),
    };
  }

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: "submission accepted",
      submission : submission
    }),
  };
};


const submitHandler = middy(submit).use(cors());
const helloHandler = middy(hello).use(cors());

module.exports = { submitHandler, helloHandler };