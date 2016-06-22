var tape = require('tape');
var phrasematch = require('../lib/phrasematch');
var deDuplicateSubqueries = phrasematch.deDuplicateSubqueries;

tape('Dedupe subqueries array', function(assert) {
    var obj = [[[ 'avenue', 'du', '18e', 'régiment' ],
                  [ 'avenue', 'du', '18e']
                ],[
                  [ 'du', '18e', 'régiment' ],
                  [ 'avenue', 'du']
                ],[
                  ['avenue', 'du', '18e']
                ]];
    var enderArray = [[true, false],
                        [true, false],
                        [false]];
    var maskArray = [[15,14],
                      [3,3],
                      [14]];
    for (var j=0; j < obj.length; j++) {
        var objInner = obj[j];
        for (var i = 0; i < objInner.length; i++) {
            obj[j][i].ender = enderArray[j][i];
            obj[j][i].mask = maskArray[j][i];
        }
    }
    var result = deDuplicateSubqueries(obj);
    var expected = [[[ 'avenue', 'du', '18e', 'régiment' ],
                     [ 'avenue', 'du', '18e']
                    ],[
                      [ 'du', '18e', 'régiment' ],
                      [ 'avenue', 'du']
                    ]];

    assert.deepEqual(JSON.stringify(result),JSON.stringify(expected), 'ok de-duped correctly');
    assert.end()
});

tape('Dedupe subqueries array variation #2', function(assert) {
    var subqueriesCollection = [];
    subqueriesCollection.push([['main','st']]);
    subqueriesCollection.push([['lake','st'],['wall', 'st'],['main','st']]);
    subqueriesCollection.push([['lake','st'],['wall', 'st'],['main','st']]);
    var deduped = deDuplicateSubqueries(subqueriesCollection);
    assert.deepEqual(deduped, [[['main','st']],[['lake','st'],['wall','st']]], 'ok de-duped correctly');
    assert.end()
});

