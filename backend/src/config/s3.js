const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.B2_ACCESS_KEY_ID,
  secretAccessKey: process.env.B2_SECRET_ACCESS_KEY,
  endpoint: process.env.B2_ENDPOINT,
  region: 'us-west-002',
 //s3ForcePathStyle: true,
  signatureVersion: 'v4'
});
const bucket = process.env.B2_BUCKET;
if (!bucket) throw new Error('B2_BUCKET not defined');
module.exports = { s3, bucket };


