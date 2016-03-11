var tape = require('tape');
var zlib = require('zlib');
var encodePhrase = require('../lib/util/termops').encodePhrase;
var DawgCache = require('../lib/util/dawg');

tape('create', function(assert) {
    var dict = new DawgCache();
    assert.pass("dawg created")
    assert.end();
});

tape('dump/load', function(assert) {
    var dict = new DawgCache();
    dict.setText("a1");
    dict.setText("a2");
    dict.setText("a3");
    dict.setText("a4");

    zlib.gzip(dict.dump(), function(err, zdata) {
        assert.ifError(err);
        assert.ok(zdata.length < 200e3, 'gzipped dictcache < 200k');
        zlib.gunzip(zdata, function(err, data) {
            assert.ifError(err);
            var loaded = new DawgCache(data);
            for (var i = 1; i <= 4; i++) {
                assert.equal(loaded.hasPhrase({text: "a" + i, ender: false}), true, 'has a' + i);
            }
            assert.equal(loaded.hasPhrase({text: "a5", ender: false}), false, 'not a5');

            assert.equal(loaded.hasPhrase({text: "a", ender: false}), false, 'not a');
            assert.equal(loaded.hasPhrase({text: "a", ender: true}), true, 'has a as degen');
            assert.deepEquals(loaded.getPhrasesFromDegen('wa'), ['washington', 'walsh'], 'found washington and walsh');
            assert.end();
        });
    });
});

tape('invalid data', function(assert) {
    var dict = new DawgCache();
    assert.throws(function() { dict.setText(""); });
    assert.end();
});
