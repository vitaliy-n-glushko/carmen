var Benchmark = require('benchmark');
var suite = new Benchmark.Suite();
var assert = require('assert');
var termops = require('../lib/util/termops');
var token = require('../lib/util/token');

module.exports = benchmark;

function benchmark(cb) {
    if (!cb) cb = function(){};
    console.log('# replace tokens');

    suite.add('Permutation', function() {
        var replacer = token.createReplacer({'Street':'St', 'North':'N'});
        assert.deepEqual(termops.replaceTokenPermutations(replacer, 'North Main Street', [
        'North Main Street',
        'N Main Street',
        'North Main St',
        'N Main St']
    ));
    })
    .on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('complete', function() {
      console.log();
      cb(null, suite);
    })
    .run();
}

if (!process.env.runSuite) benchmark();