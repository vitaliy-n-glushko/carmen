var fs = require('fs');
var q = require('queue-async')(1);
var argv = require('minimist')(process.argv.slice(2));

var files = fs.readdirSync(__dirname);

process.env.runSuite = true;
var minSample = argv.minSample || 100;

files.forEach(function(d) {
    if (['expected', 'fixtures', 'runbench.js'].indexOf(d) >= 0) return;
    q.defer(require('./'+d), minSample);
});

q.awaitAll(function(err, data){
    console.log('Benchmarking complete');
    // do something with data
});
