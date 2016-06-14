var termops = require('../lib/util/termops');
var test = require('tape');
var token = require('../lib/util/token');

test('2 tokens - all match', function(assert) {
    var replacer = token.createReplacer({'Street':'St', 'North':'N'});
    assert.deepEqual(termops.replaceTokenPermutations(replacer, 'North Main Street', [
        'North Main Street',
        'N Main Street',
        'North Main St',
        'N Main St']
    ));
    assert.end();
});

test('3 tokens - all match', function(assert) {
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

test('4 tokens - one does not match', function(assert) {
    var replacer = token.createReplacer({'Street':'St', 'North':'N', 'Main':'Mn', 'Thirteenth':'13th', "(?<number>2\\d+)": "###${number}###"});
    assert.deepEqual(termops.replaceTokenPermutations(replacer, '123 North Main Street', [
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