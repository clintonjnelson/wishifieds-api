'use strict';

var AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});  // OR SET env variable AWS_DEFAULT_REGION


module.exports = {
  defaultS3: defaultS3,
  s3Upload: s3Upload,
  getImageExtension: getImageExtension
}

function defaultS3() {
  var accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  console.log("PASSCODES: ", accessKeyId, "/", secretAccessKey);
  var s3 = new AWS.S3({
    // bucket: bucketName,
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    apiVersion: '2006-03-01',
  });

  return s3;
}

function getImageExtension(files) {
  var defaultFileExtension = 'jpg';
  var supportedImageTypes = {
    'apng': true,
    'bmp': true,
    'gif': true,
    'ico': true,
    'jpg': true,
    'jpeg': true,
    'png': true,
    'svg': true,
  }

  if(files && files.length < 1) {
    return defaultFileExtension;
  }
  else {
    var foundExtension =
      files
        .map(function(file) {
          if(!file) { return false; }
          else {
            return file.split('.').pop();
          }
        })
        .filter(function(ext) {
          return supportedImageTypes[ext] == true;
        })
        .pop();

    return foundExtension || defaultFileExtension;
  }
}


// Avatars bucket: wishifieds-avatars
// TODO: MAY WANT TO TOKENIZE A FILENAME & PASS BACK IN RESPONSE FOR DB SAVE & RESPONSE TO UI
function s3Upload(files, bucketName, objectKeyPrefix, iamUserKey, iamUserSecret, callback) {
  var s3 = new AWS.S3({
    bucket: bucketName,
    accessKeyId: iamUserKey,
    secretAccessKey: iamUserSecret,
    apiVersion: '2006-03-01',
  });

  // s3.abortMultipartUpload(params, function (err, data) {
  //   if (err) console.log(err, err.stack); // an error occurred
  //   else     console.log(data);           // successful response
  // });

  // Setup the objects to upload to S3 & map the results into files
  var results = files.map(function(file) {
    // Upload file to bucket with name of Key
    s3.upload({
      Bucket: bucketName,
      Key: objectKeyPrefix + file.originalname, // Prefix should have "." on each end
      Body: file.buffer,
      ACL: 'public-read'  // TODO: CHANGE THIS & READ FROM CLOUDFRONT INSTEAD
    },
    function(error, data) {
      // TODO: Maybe refine this to show only data care about elsewhere
      if(error) {
        console.log("Error uploading file to S3: ", error);
        return {error: true, data: error};
      } else {
        console.log('File uploaded. Data is:', data);
        return {error: false, data: data};
      }
    });
  });

  callback(results);  // Results could be errors or successes
}


// MULTER FILE INFO
// { fieldname: 'avatar',
//   originalname: 'profile.png',
//   encoding: '7bit',
//   mimetype: 'image/png',
//   destination: './uploads/',
//   filename: 'profile.png',
//   path: 'uploads/profile.png',
//   size: 1286 }





