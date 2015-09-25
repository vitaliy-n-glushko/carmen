var Benchmark = require('benchmark');
var suite = new Benchmark.Suite();
var assert = require('assert');
var termops = require('../lib/util/termops');
var argv = require('minimist')(process.argv.slice(2));

module.exports = benchmark;

function benchmark(minSample, cb) {
    if (!cb) cb = function(){};
    console.log('# decollide');

    suite
    .add('decollide (collision)', function() {
        assert.equal(termops.decollide([], {
            properties: { 'carmen:text': 'r ademar da silva neiva #'}
        }, 'av francisco de aguirre # la serena'), false);
    }, {
        'minSamples': minSample
    })
    .add('decollide (clean)', function() {
        assert.equal(termops.decollide([], {
            properties: { 'carmen:text': 'av francisco de aguirre #'}
        }, 'av francisco de aguirre'), true);
    }, {
        'minSamples': minSample
    })
    .on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('complete', function() {
        console.log();
        cb(null, this);
    })
    .run();
}

if (!process.env.runSuite) benchmark(argv.minSample || 100);

