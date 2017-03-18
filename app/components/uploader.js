'use strict';

var config = require('config');
var multer = require('multer');

var uploader = {};

uploader.submission = multer({
  dest: global.uploadDirectory,
  limits: {
    fileSize: config.get('maxSubmissionSize')
  }
}).single('file');

module.exports = uploader;