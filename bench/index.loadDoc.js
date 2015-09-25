var suite = new (require('benchmark').Suite)();
var assert = require('assert');
var worker = require('../lib/indexer/indexdocs-worker.js');
var argv = require('minimist')(process.argv.slice(2));

var patch = { grid:{}, docs:[] };
var doc = require('./fixtures/verifymatch.verifyFeatures.loaded.json')[0];
var freq = { 0:[100], 1:[1] };
var zoom = 14;
var token_replacer = [];


module.exports = benchmark;

function benchmark(minSample, cb) {
    if (!cb) cb = function(){};
    console.log('# index.loadDoc');

    suite.add('loadDoc', function() {
        worker.loadDoc(patch, doc, freq, zoom, token_replacer);
    }, { 'minSamples': minSample })
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