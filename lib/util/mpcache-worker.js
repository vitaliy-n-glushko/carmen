var Cache = require('./cxxcache'),
    queue = require('queue-async'),
    tilelive = require('tilelive');

var cacheId, size, cache, source, getter;

process.on('message', function(data) {
    if (data.func && data.cbId) {
        console.log('rpc', process.pid, data.func);
        callable[data.func](data.opts, function(response) {
            process.send({
                response: response,
                cbId: data.cbId
            })
        })
    } else {
        console.log('other');
        // handle other things here
    }
});

// define a version of loadall that already knows what shards we want, since that's been calculated upstream
var callable = {
    init: function(opts, callback) {
        console.log('spawning cache')
        cacheId = opts.id;
        size = opts.size;

        cache = new Cache(cacheId, size);

        var uri = tilelive.auto(opts.source_uri);

        if (!tilelive.protocols[uri.protocol]) return process.send('Invalid tilesource protocol');
        source = new tilelive.protocols[uri.protocol](uri, function() {
            source._geocoder = {geocoder_address: opts.geocoder_address};

            getter = source.getGeocoderData.bind(source);

            source.startWriting(callback);
        });
    },
    loadall: function(opts, callback) {
        var type = opts.type,
            allshards = opts.allshards;

        var shards = [];
        for (var i = 0; i < allshards.length; i++) {
            if (!cache.has(type, +allshards[i])) shards.push(allshards[i]);
        }

        var q = queue(10);
        for (var i = 0; i < shards.length; i++) {
            q.defer(getter, type, +shards[i]);
        }

        q.awaitAll(function(err, buffers) {
            if (err) return callback({err: err});
            for (var i = 0; i < buffers.length; i++) {
                if (!buffers[i]) continue;
                // Sync load is used because async call is
                // experimental/not yet stable
                try {
                    cache.loadSync(buffers[i], type, +shards[i]);
                } catch (e) {
                    return callback(e);
                }
            }
            callback();
        });
    },
    updateFreqs: function(opts, callback) {
        var queues = opts.queues,
            freq = opts.freq;

        callable.loadall({allshards: Object.keys(queues), type: 'freq'}, function(err) {
            if (err) return callback(err);

            var shard;
            for (var _shard in queues) {
                ids = queues[_shard];
                shard = +_shard;
                for (var i = 0; i < ids.length; i++) {
                    var id = ids[i];
                    freq[id][0] = (cache._get('freq', shard, +id) || [0])[0] + freq[id][0];
                    // maxscore should not be cumulative.
                    if (id === 1) {
                        freq[id][0] = (cache._get('freq', shard, +id) || [0,0])[0] || freq[id][0];
                    }
                    cache._set('freq', shard, +id, freq[id]);
                }
            }
            callback();
        });
    },
    setGridParts: function(opts, callback) {
        var queues = opts.queues,
            data = opts.data;

        callable.loadall({allshards: Object.keys(queues), type: 'grid'}, function(err) {
            if (err) return callback(err);

            var shard;
            for (var _shard in queues) {
                ids = queues[_shard];
                shard = +_shard;
                for (var i = 0; i < ids.length; i++) {
                    var id = ids[i];
                    // This merges new entries on top of old ones.
                    cache._set('grid', shard, +id, data[id], true);
                }
            }
            callback();
        });
    },
    resetStat: function(opts, callback) {
        var queues = opts.queues;

        var shard;
        for (var _shard in queues) {
            ids = queues[_shard];
            shard = +_shard;
            for (var i = 0; i < ids.length; i++) {
                var id = ids[i];
                cache._set('stat', shard, +id, []);
            }
        }
        callback();
    },
    store: function(opts, callback) {
        cache.store(source, callback);
    },
    exit: function(opts, callback) {
        var done = function() {
            source.stopWriting(function() {
                callback();
                console.log('callback called; exiting');
                process.exit(0);
            });
        }
        console.log(process.pid, "source", source);
        return source._commit ? source._commit(done) : done();
    }
}
