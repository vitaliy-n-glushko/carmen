var termops = require('../lib/util/termops');
var test = require('tape');
var clone = function(d) { return JSON.parse(JSON.stringify(d)); }
var token = require('../lib/util/token');

test('termops.replaceTokenPermutations', function(assert) {
    var replacer = token.createReplacer({'street':'st', 'north':'n'});
    console.log(termops.replaceTokenPermutations(replacer, 'North Main Street'));
    assert.deepEqual(termops.replaceTokenPermutations(replacer, 'North Main Street', [
        ['North Main Street'],
        ['N Main Street'],
        ['North Main St'],
        ['N Main St']
    ]));
});
