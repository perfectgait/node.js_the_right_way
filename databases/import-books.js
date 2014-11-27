'use strict';

const
  async = require('async'),
  file = require('file'),
  rdfParser = require('./lib/rdf-parser'),
  request = require('request'),
  work = async.queue(function(path, done) {
    rdfParser(path, function(err, doc) {
      if (doc) {
        request({
          method: 'PUT',
          url: 'http://localhost:5984/books/' + doc._id,
          json: doc
        }, function(err, res, body) {
          if (err) {
            throw err;
          }

          console.log(res.statusCode, body);
          done();
        });
      }
    });
  }, 10),
  rdfRegexp = /\.rdf/;

console.log('beginning directory walk');

file.walk(__dirname + '/cache', function(err, dirPath, dirs, files) {
  files.forEach(function(path) {
    if (rdfRegexp.test(path)) {
      work.push(path);
    }
  });
});
