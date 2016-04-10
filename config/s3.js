var s3 = require('s3');

var client = s3.createClient({
    maxAsyncS3: 20,     // this is the default
    s3RetryCount: 3,    // this is the default
    s3RetryDelay: 1000, // this is the default
    multipartUploadThreshold: 20971520, // this is the default (20 MB)
    multipartUploadSize: 15728640, // this is the default (15 MB)
    s3Options: {
        accessKeyId: "AKIAIWR6PYHKRQBA2MLA",
        secretAccessKey: "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",
        // any other options are passed to new AWS.S3()
        // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
    },
});

var exports = module.exports = {};

exports.upload = function(upKey, location, callback) {
    var params = {
        localFile: location,

        s3Params: {
            Bucket: "research-engine",
            Key: upKey,
            ACL: 'public-read'
            // other options supported by putObject, except Body and ContentLength.
            // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
        },
    };
    var uploader = client.uploadFile(params);
    uploader.on('error', function(err) {
        console.error(err);
    });
    uploader.on('progress', function() {
        console.log("progress", uploader.progressMd5Amount,
            uploader.progressAmount, uploader.progressTotal);
    });
    uploader.on('end', function() {
        console.log("done uploading");
        callback(exports.getPublicUrl(params.s3Params.Key));
    });
};

exports.getPublicUrl = function(upKey) {
    var bucket = "research-engine", key = upKey;
    return s3.getPublicUrlHttp(bucket, key);
};
