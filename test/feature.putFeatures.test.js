var tape = require('tape');
var feature = require('../lib/util/feature.js');
var Memsource = require('../lib/api-mem.js');
var Carmen = require('../index.js');

var source = new Memsource(null, function() {});
var conf = { source: source };
var carmen = new Carmen(conf);

tape('putFeatures', function(assert) {
    assert.ok(carmen);
    feature.putFeatures(conf.source, [
        {
            id: 1,
            type: 'Feature',
            properties: {
                'carmen:text': 'a',
                'carmen:center': [ 0, 0 ],
                'carmen:zxy': ['6/32/32']
            },
            geometry: {
                type: 'Point',
                coordinates: [ 0, 0 ]
            }
        },
        {
            id: 2,
            type: 'Feature',
            properties: {
                'carmen:text': 'b',
                'carmen:center': [ 0, 0 ],
                'carmen:zxy': ['6/32/32']
            },
            geometry: {
                type: 'Point',
                coordinates: [ 0, 0 ]
            }
        },
        {
            id: Math.pow(2,20) + 1,
            type: 'Feature',
            properties: {
                'carmen:text': 'c',
                'carmen:center': [360/64+0.001,0],
                'carmen:zxy': ['6/33/32']
            },
            geometry: {
                type: 'Point',
                coordinates: [360/64+0.001,0]
            }
        },
    ], function(err) {
        assert.ifError(err);
        assert.equal(source._shards.feature[1], '{"1":{"id":1,"type":"Feature","properties":{"carmen:text":"a","carmen:center":[0,0],"carmen:zxy":["6/32/32"]},"geometry":{"type":"Point","coordinates":[0,0]}},"1048577":{"id":1048577,"type":"Feature","properties":{"carmen:text":"c","carmen:center":[5.626,0],"carmen:zxy":["6/33/32"]},"geometry":{"type":"Point","coordinates":[5.626,0]}}}', 'has feature shard 1');
        assert.equal(source._shards.feature[2], '{"2":{"id":2,"type":"Feature","properties":{"carmen:text":"b","carmen:center":[0,0],"carmen:zxy":["6/32/32"]},"geometry":{"type":"Point","coordinates":[0,0]}}}', 'has feature shard 2');
        assert.end();
    });
});

tape('getFeatureByCover', function(assert) {
    feature.getFeatureByCover(conf.source, { id:1, x:32, y:32 }, function(err, data) {
        assert.equal(data.id, 1);
        assert.end();
    });
});

tape('getFeatureByCover', function(assert) {
    feature.getFeatureByCover(conf.source, { id:1, x:33, y:32 }, function(err, data) {
        assert.equal(data.id, 1048577);
        assert.end();
    });
});

tape('getFeatureById', function(assert) {
    feature.getFeatureById(conf.source, 1, function(err, data) {
        assert.equal(data.id, 1);
        assert.end();
    });
});

