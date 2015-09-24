var Cache = require('./cxxcache'),
    fork = require('child_process').fork,
    queue = require('queue-async');

var MPCache = function(id, size, source, geocoder_address) {
    console.log('size', size)
    this.id = id;
    this.size = size;
    this.cpus = require('os').cpus().length;

    this.workers = [];
    for (var i = 0; i < this.cpus; i++) {
        this.workers[i] = this.workers[i] || fork(__dirname + '/mpcache-worker.js');
        this.workers[i].send({
            id: id,
            "size": this.size, // should this instead by size / cpus ?
            source_uri: "mbtiles://" + source.filename,
            geocoder_address: geocoder_address
        });
        this.workers[i].removeAllListeners('exit');
        //this.workers[i].on('exit', exit);
        this.workers[i].removeAllListeners('message');

        this.workers[i].on('message', function(data) {
            if (typeof patch === 'string') return error(new Error(patch));

            if (data.cbId) {
                callbacks[data.cbId](data.response);
                delete callbacks[data.cbId];
            }
        });
    }
}

var callbacks = {}
var cbCount = 0;
var childDo = function(child, func, opts, callback) {
    var toSend = {
        func: func,
        opts: opts,
        cbId: ++cbCount
    }
    callbacks[toSend.cbId] = callback;
    child.send(toSend);
}

MPCache.prototype.runAll = function(func, optsPerChild, optsShared, callback) {
    var cache = this;
    var q = queue(this.cpus);
    for (var i = 0; i < this.cpus; i++) {
        q.defer(function(i, callback) {
            var opts = {};
            for (var key in optsPerChild) opts[key] = optsPerChild[key][i];
            for (var key in optsShared) opts[key] = optsShared[key];

            childDo(cache.workers[i], func, opts, function(response) {
                callback(response ? response.err : null, response);
            })
        }, i);
    }

    q.awaitAll(callback);
}

MPCache.prototype.loadall = function(getter, type, ids, callback) {
    var cache = this;
    var queues = Cache.shards(type, ids);

    var allshards = Object.keys(queues);

    var bins = [];
    for (var i = 0; i < this.cpus; i++) bins[i] = [];

    for (var i = 0; i < allshards.length; i++) {
        bins[+allshards[i] % this.cpus].push(allshards[i]);
    }

    this.runAll("loadall", {allshards: bins}, {type: type}, function(err) {
        callback(err, allshards, queues);
    })
};

MPCache.prototype.setGridParts = function(getter, data, callback) {
    var ids = Object.keys(data);
    var cache = this;

    var queues = Cache.shards('grid', ids);
    var allshards = Object.keys(queues);

    var bins = [];
    var dataBins = [];
    for (var i = 0; i < this.cpus; i++) {
        bins[i] = {};
        dataBins[i] = {};
    }

    for (var i = 0; i < allshards.length; i++) {
        var offset = +allshards[i] % this.cpus;
        bins[offset][allshards[i]] = queues[allshards[i]];

        var shardIds = queues[allshards[i]];
        for (j = 0; j < shardIds.length; j++) {
            var id = shardIds[j];
            dataBins[offset][id] = data[id];
        }
    }

    var q = queue(2);
    q.defer(this.runAll.bind(this), "setGridParts", {queues: bins, data: dataBins}, {});

    var statQueues = Cache.shards('stat', ids);
    var statAllshards = Object.keys(statQueues);

    var statBins = [];
    for (var i = 0; i < this.cpus; i++) statBins[i] = {};

    for (var i = 0; i < statAllshards.length; i++) {
        statBins[+statAllshards[i] % this.cpus][statAllshards[i]] = statQueues[statAllshards[i]];
    }

    q.defer(this.runAll.bind(this), "resetStat", {queues: statBins}, {});

    q.awaitAll(callback);
}

MPCache.prototype.updateFreqs = function(getter, ids, freq, callback) {
    var cache = this;
    var queues = Cache.shards('freq', ids);

    var allshards = Object.keys(queues);

    var bins = [];
    var freqBins = [];
    for (var i = 0; i < this.cpus; i++) {
        bins[i] = {};
        freqBins[i] = {};
    }

    for (var i = 0; i < allshards.length; i++) {
        var offset = +allshards[i] % this.cpus;
        bins[offset][allshards[i]] = queues[allshards[i]];

        var shardIds = queues[allshards[i]];
        for (j = 0; j < shardIds.length; j++) {
            var id = shardIds[j];
            freqBins[offset][id] = freq[id];
        }
    }

    this.runAll("updateFreqs", {queues: bins, freq: freqBins}, {}, callback);
}

// ## Store
//
// Serialize and make permanent the index currently in memory for a source.
MPCache.prototype.store = function(source, callback) {
    this.runAll("store", {}, {}, callback);
}

module.exports = MPCache;
