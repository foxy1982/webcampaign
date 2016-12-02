var chokidar = require('chokidar');
var pathfinder = require('path');
var fs = require('fs');
var directory = '/var/lib/motion/';
var AWS = require('aws-sdk');

var awsCred = new AWS.SharedIniFileCredentials({profile: 'webcampaign'});
AWS.config.credentials = awsCred;

var watcher = chokidar.watch(directory, {
  ignored: /[\/\\]\./,
  ignoreInitial: true,
  persistent: true
});

var extract_filename = function(path){
  return pathfinder.basename(path);
};

var aws_upload = function(filepath){
  var s3 = new AWS.S3();
  var filename = extract_filename(filepath);
  s3.putObject({
    Bucket: 'webcampaign',
    Key: 'images/' + filename,
    Body: fs.createReadStream(filepath),
    ACL: 'public-read'
  }, function(err){
    if(err){
      console.log('Unable to upload ' + filename);
    }
    remove_local_file(filepath);
  });
};

var remove_local_file = function(filepath){
  fs.unlink(filepath, function(err) {
    if (err) {
      console.log('Error removing file: ', err);
    } else {
      console.log('Removed local file: ', filepath);
    }
  });
};

watcher.on('add', function(path){
  console.log('The path is: ' + path);
  console.log('The file is: ' + extract_filename(path));
  console.log('Attempting to upload to S3');
  aws_upload(path);
});
