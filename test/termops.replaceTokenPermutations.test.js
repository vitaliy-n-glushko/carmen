var termops = require('../lib/util/termops');
var test = require('tape');
var token = require('../lib/util/token');

test('termops.replaceTokenPermutations', function(assert) {
    var replacer = token.createReplacer({'Street':'St', 'North':'N'});
    assert.deepEqual(termops.replaceTokenPermutations(replacer, 'North Main Street', [
        'North Main Street',
        'N Main Street',
        'North Main St',
        'N Main St']
    ));
    assert.end();
});

test('termops.replaceTokenPermutations', function(assert) {
    var replacer = token.createReplacer({'Street':'St', 'North':'N', 'Main':'Mn'});
    assert.deepEqual(termops.replaceTokenPermutations(replacer, 'North Main Street', [
        'North Main Street',
        'N Main Street',
        'North Main St',
        'N Main St',
        'North Mn St',
        'N Mn St',
        'N Mn Street']
    ));
    assert.end();
});
