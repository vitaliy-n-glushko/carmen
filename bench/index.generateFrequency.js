var Benchmark = require('benchmark');
var suite = new Benchmark.Suite();
var assert = require('assert');
var index = require('../lib/index');
var docs = require('../test/fixtures/docs.json');
var argv = require('minimist')(process.argv.slice(2));

module.exports = benchmark;

function benchmark(minSample, cb) {
    if (!cb) cb = function(){};
    console.log('# index.generateFrequency');

    suite.add('index.generateFrequency', function() {
        index.generateFrequency(docs, {});
    }, {'minSamples': minSample})
    .on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('complete', function() {
        console.log();
        cb(null, suite);
    })
    .run();
}

if (!process.env.runSuite) benchmark(argv.minSample || 100);