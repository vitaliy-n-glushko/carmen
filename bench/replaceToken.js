var Benchmark = require('benchmark');
var suite = new Benchmark.Suite();
var token = require('../lib/util/token');
var tokens = require('./fixtures/tokens.json');
var argv = require('minimist')(process.argv.slice(2));

var replacers = token.createReplacer(tokens);

module.exports = benchmark;

function benchmark(minSample, cb) {
    if (!cb) cb = function(){};
    console.log('# token.replaceToken');

    suite.add('token replace', function() {
        var res = token.replaceToken(replacers, 'kanye west');
    }, { 'minSamples': minSample })
    .on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('complete', function() {
      console.log('Fastest is ' + this.filter('fastest').pluck('name'), '\n');
      cb(null, suite);
    })
    .run();
}

if (!process.env.runSuite) benchmark(argv.minSample || 100);
