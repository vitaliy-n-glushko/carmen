var test = require('tape');
var token = require('../lib/util/token');
var fixture = require('./fixtures/tokens.json')

test('2 tokens - all match', function(assert) {
    var replacer = token.createReplacer({'Street':'St', 'North':'N'});
    assert.deepEqual(token.getQueryTokenVariations(replacer, ['north', 'main', 'street']).sort(), 
        [['north', 'main', 'street'], ['n', 'main', 'st'], ['north', 'main', 'st'], ['n', 'main', 'street']].sort());
    assert.end();
});

test('3 tokens - all match', function(assert) {
    var replacer = token.createReplacer({'Street':'St', 'North':'N', 'Main':'Mn'});
    assert.deepEqual(token.getQueryTokenVariations(replacer, ['north', 'main', 'street']).sort(), [
        // 0 replacements
        ['north', 'main', 'street'],
        // 1 at a time
        // 100
        // 010
        // 001
        ['n', 'main', 'street'],
        ['north', 'mn', 'street'],
        ['north', 'main', 'st'],
        // 2 at a time
        // 110
        // 101
        // 011
        ['n', 'mn', 'street'],
        ['n', 'main', 'st'],
        ['north', 'mn', 'st'],
        // 3 at a time
        ['n', 'mn', 'st']
    ].sort());
    assert.end();
});

test('4 tokens - all match', function(assert) {
    var replacer = token.createReplacer({'Street':'St', 'North':'N', 'Main':'Mn', 'West': 'W'});
    assert.deepEqual(token.getQueryTokenVariations(replacer, ['north', 'west', 'main', 'street']).sort(), [
        // 0 replacements
        ['north', 'west', 'main', 'street'],
        // 1 at a time
        // 1000
        // 0100
        // 0010
        // 0001
        ['n', 'west', 'main', 'street'],
        ['north', 'w', 'main', 'street'],
        ['north', 'west', 'mn', 'street'],
        ['north', 'west', 'main', 'st'],
        // 2 at a time
        //1100
        //1010
        //1001
        //0110
        //0101
        //0011
        ['n', 'w', 'main', 'street'],
        ['n', 'west', 'mn', 'street'],
        ['n', 'west', 'main', 'st'],
        ['north', 'w', 'mn', 'street'],
        ['north', 'w', 'main', 'st'],
        ['north', 'west', 'mn', 'st'],
        // 3 at a time
        //1110
        //1101
        //1011
        //0111
        ['n', 'w', 'mn', 'street'],
        ['n', 'w', 'main', 'st'],
        ['n', 'west', 'mn', 'st'],
        ['north', 'w', 'mn', 'st'],
        // 4 at a time
        ['n', 'w', 'mn', 'st']
    ].sort());
    assert.end();
});

test('Tokens for CJK characters', function(assert) {
    var tokens = token.createReplacer(fixture);
    assert.deepEqual(token.getQueryTokenVariations(tokens, ['9丁目']), [ ['9丁目'], ['九丁目'] ], 'should be equivalent');
    assert.end();
});

test('Word boundaries an unicode characters', function(assert) {
    var replacer = token.createReplacer({'North':'N'});
    assert.deepEqual(token.getQueryTokenVariations(replacer, ['general', 'pirán', 'argentina']),
        [['general', 'pirán', 'argentina']]);
    assert.end();
});
