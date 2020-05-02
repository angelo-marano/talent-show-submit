"use strict";
var AWS = require("aws-sdk");
const middy = require("middy");
const { cors } = require("middy/middlewares");
const axios = require("axios");

const requestUploadUrl = async (event, context) => {
  var s3 = new AWS.S3();
  var params = JSON.parse(event.body);

  var recaptchaPostBody = {
    secret: process.env.RECAPTCHA_KEY,
    response: params.metadata.captcha,
  };

  const recaptchaUrl = `https://www.google.com/recaptcha/api/siteverify`;

  try {
    const response = await axios.post(recaptchaUrl, recaptchaPostBody);
  } catch (e) {
    console.error(e);
    return {
      statusCode: 400,
      body: "INVALID CAPTCHA!!!!!",
    };
  }

  const s3Params = {
    Bucket: "keyshake-talentshowupload",
    Key: params.name,
    ContentType: params.type,
    Metadata: params.metadata,
    ACL: "public-read",
  };

  var uploadURL = s3.getSignedUrl("putObject", s3Params);
  return {
    statusCode: 200,
    body: JSON.stringify({ uploadURL: uploadURL }),
  };
};

const requestUploadUrlHandler = middy(requestUploadUrl).use(cors());

module.exports = { requestUploadUrlHandler };
