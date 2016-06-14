var Benchmark = require('benchmark');
var suite = new Benchmark.Suite();
var assert = require('assert');
var termops = require('../lib/util/termops');
var token = require('../lib/util/token');
var tape = require('tape');

module.exports = benchmark;

function benchmark(cb) {
    if (!cb) cb = function() {};
    console.log('# replace tokens');

    suite.add('Permutation of 1 token', function() {
        var replacer = token.createReplacer({'Street':'St', 'North':'N'});
        assert.deepEqual(termops.replaceTokenPermutations(replacer, 'North Main Street'), ['North Main Street', 'N Main St', 'North Main St', 'N Main Street']
        );
    })
    suite.add('Permutation of 3 tokens', function() {
        var replacer = token.createReplacer({'Street':'St', 'North':'N', 'Main':'Mn'});
        assert.deepEqual(termops.replaceTokenPermutations(replacer, 'North Main Street'), ['North Main Street',
         'N Mn St',
         'N Main St',
         'N Mn Street',
         'North Main St',
         'N Main Street',
         'North Mn Street']);
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