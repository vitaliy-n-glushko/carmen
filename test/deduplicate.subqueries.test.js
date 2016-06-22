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
    subqueriesCollection[0][0].ender = false;
    subqueriesCollection[0][0].mask = 9;
    subqueriesCollection.push([['lake','st'],['wall', 'st'],['main','st']]);
    subqueriesCollection[1][0].ender = false;
    subqueriesCollection[1][0].mask = 5;
    subqueriesCollection[1][1].ender = true;
    subqueriesCollection[1][1].mask = 3;
    subqueriesCollection[1][2].ender = false;
    subqueriesCollection[1][2].mask = 9;
    subqueriesCollection.push([['lake','st'],['wall', 'st'],['main','st']]);
    subqueriesCollection[2][0].ender = false;
    subqueriesCollection[2][0].mask = 5;
    subqueriesCollection[2][1].ender = true;
    subqueriesCollection[2][1].mask = 3;
    subqueriesCollection[2][2].ender = false;
    subqueriesCollection[2][2].mask = 9;
    var deduped = deDuplicateSubqueries(subqueriesCollection);
    assert.deepEqual(JSON.stringify(deduped), JSON.stringify([[['main','st']],[['lake','st'],['wall','st']]]), 'ok de-duped correctly');
    assert.end()
});

tape('Dedupe arrays with tokens - having same mask and ender but different text', function(assert) {
    var subqueriesCollection = [];
    subqueriesCollection.push([['23-414','beach','street'],['23###','beach','street'],[ '23-414','beach'],[ 'beach','street'],[ '23###','beach'],[ '23-414'],[ 'beach'],[ 'street'],[ '23###']]);

    var enderArray = [true, true, false, true, false, false, false, true, false];
    var maskArray = [7,7,3,6,3,1,2,4,1];

    for (var j=0; j < obj[0][0].length; j++) {
        obj[0][0][j].ender = enderArray[j];
        obj[0][0][j].mask = maskArray[j];
    }

    var result = deDuplicateSubqueries(obj);
    var expected = [[['23-414','beach','street'],['23###','beach','street'],['23-414','beach'],['beach','street'],['23###','beach'],['23-414'],['beach'],['street'],['23###']]];

    assert.deepEqual(JSON.stringify(result),JSON.stringify(expected), 'ok de-duped correctly');
    assert.end()
});

