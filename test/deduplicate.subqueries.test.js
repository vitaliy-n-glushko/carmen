var tape = require('tape');
var phrasematch = require('../lib/phrasematch');
var deDuplicateSubqueries = phrasematch.deDuplicateSubqueries;

tape('Dedupe subqueries array', function(assert) {
    var subqueriesCollection = [ [['avenue', 'du', '18e', 'régiment'],[ 'avenue', 'du', '18e']],
                [['du', '18e', 'régiment'],['avenue', 'du']],
                [['avenue', 'du', '18e']]
              ];
    var enderArray = [[true, false],[true, false],[false]];
    var maskArray = [[15,14],[3,3],[14]];
    var textArray = [['avenue du 18e régiment', 'avenue du 18e'],['du 18e régiment', 'avenue du'],['avenue du 18e']];

    for (var j=0; j < subqueriesCollection.length; j++) {
        var objInner = subqueriesCollection[j];
        for (var i = 0; i < objInner.length; i++) {
            subqueriesCollection[j][i].ender = enderArray[j][i];
            subqueriesCollection[j][i].mask = maskArray[j][i];
            subqueriesCollection[j][i].text = textArray[j][i];
        }
    }
    var result = deDuplicateSubqueries(subqueriesCollection);
    var expected = [ [[ 'avenue', 'du', '18e', 'régiment' ],[ 'avenue', 'du', '18e']],
                     [[ 'du', '18e', 'régiment' ],[ 'avenue', 'du']]
                   ];

    assert.deepEqual(JSON.stringify(result),JSON.stringify(expected), 'ok de-duped correctly');
    assert.end()
});

tape('Dedupe subqueries array variation #2', function(assert) {
    var subqueriesCollection = [];
    subqueriesCollection.push([['main','st']]);
    subqueriesCollection.push([['lake','st'],['wall', 'st'],['main','st']]);
    subqueriesCollection.push([['lake','st'],['wall', 'st'],['main','st']]);

    var enderArray = [[false],[false,true, false],[false, true, false]];
    var maskArray = [[9],[5,3,9],[5,3,9]];
    var textArray = [['main st'],['lake st', 'wall st', 'main st'],['lake st', 'wall st', 'main st']];

    for (var j=0; j < subqueriesCollection.length; j++) {
        var objInner = subqueriesCollection[j];
        for (var i = 0; i < objInner.length; i++) {
            subqueriesCollection[j][i].ender = enderArray[j][i];
            subqueriesCollection[j][i].mask = maskArray[j][i];
            subqueriesCollection[j][i].text = textArray[j][i];
        }
    }

    var result = deDuplicateSubqueries(subqueriesCollection);
    var expected = [[['main','st']],[['lake','st'],['wall','st']]];
    assert.deepEqual(JSON.stringify(result), JSON.stringify(expected), 'ok de-duped correctly');
    assert.end()
});

tape('Dedupe arrays with tokens - having same mask and ender but different text', function(assert) {
    var subqueriesCollection = [];
    subqueriesCollection.push([['23-414','beach','street'],['23###','beach','street'],[ '23-414','beach'],[ 'beach','street'],[ '23###','beach'],[ '23-414'],[ 'beach'],[ 'street'],[ '23###']]);

    var enderArray = [true, true, false, true, false, false, false, true, false];
    var maskArray = [7,7,3,6,3,1,2,4,1];
    var textArray = [['23-414 beach street','23### beach street', '23-414 beach', 'beach street', '23### beach', '23-414', 'beach', 'street', '23###']];

    for (var j=0; j < subqueriesCollection.length; j++) {
        var objInner = subqueriesCollection[j];
        for (var i = 0; i < objInner.length; i++) {
            subqueriesCollection[j][i].ender = enderArray[j][i];
            subqueriesCollection[j][i].mask = maskArray[j][i];
            subqueriesCollection[j][i].text = textArray[j][i];
        }
    }

    var result = deDuplicateSubqueries(subqueriesCollection);
    var expected = [[['23-414','beach','street'],['23###','beach','street'],['23-414','beach'],['beach','street'],['23###','beach'],['23-414'],['beach'],['street'],['23###']]];

    assert.deepEqual(JSON.stringify(result),JSON.stringify(expected), 'ok de-duped correctly');
    assert.end()
});

