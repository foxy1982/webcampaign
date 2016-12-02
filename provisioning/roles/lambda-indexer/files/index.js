var moment = require('moment');
var AWS = require('aws-sdk');
var _ = require('lodash');

exports.handler = (event, context, callback) => {

    var s3 = new AWS.S3();

    var prefix = 'images/' + moment().format("YYYYMMDDHH");

    var params = {
        Bucket: 'webcampaign',
        Prefix: prefix,
        Delimiter:'/',
        MaxKeys: 1000
    };

    console.log('finding for prefix:' + prefix);

    s3.listObjects(params, function(err, data) {
        if (err) {
            return console.log(err, err.stack); // an error occurred
        }

        var sortedList = _.sortBy(data.Contents, ['key']).reverse();

        var imageUrl = 'https://s3-eu-west-1.amazonaws.com/webcampaign/' + sortedList[0].Key;

        var html = '<html><body><img src="'+ imageUrl + '" /></body></html>';

        var result = {
          imageUrl: imageUrl
        }

        context.succeed(result);
    });
}
