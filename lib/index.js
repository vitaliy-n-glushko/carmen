var mp32 = Math.pow(2,32);
var termops = require('./util/termops'),
    token = require('./util/token'),
    feature = require('./util/feature'),
    uniq = require('./util/uniq'),
    ops = require('./util/ops'),
    queue = require('queue-async'),
    indexdocs = require('./indexer/indexdocs'),
    TIMER = process.env.TIMER,
    DEBUG = process.env.DEBUG;

module.exports = index;
module.exports.update = update;
module.exports.generateFrequency = generateFrequency;
module.exports.store = store;
module.exports.cleanDocs = cleanDocs;
module.exports.teardown = teardown;

function index(geocoder, from, to, options, callback) {
    options = options || {};

    to.startWriting(function(err) {
        if (err) return callback(err);

        process(options);

        function process(options) {
            if (TIMER) console.time('getIndexableDocs');
            from.getIndexableDocs(options, function(err, docs, options) {
                if (TIMER) console.timeEnd('getIndexableDocs');
                if (err) return callback(err);
                if (!docs.length) {
                    // All docs processed + validated.
                    // Teardown to kill workers.
                    teardown();

                    geocoder.emit('store');
                    store(to, function(err) {
                        if (err) return callback(err);

                        var q = queue(10);
                        q.defer(to.stopWriting.bind(to));
                        if (to._geocoder.teardown) {
                            q.defer(to._geocoder.teardown.bind(to._geocoder));
                        }
                        q.awaitAll(callback);
                    });
                } else {
                    geocoder.emit('index', docs.length);
                    update(to, docs, from._geocoder.zoom, function(err) {
                        if (err) return callback(err);
                        process(options);
                    });
                }
            });
        }
    });
}

// # Update
//
// Updates the source's index with provided docs.
//
// @param {Object} source - a Carmen source
// @param {Array} docs - an array of documents
// @param {Function} callback
function update(source, docs, zoom, callback) {
    // First pass over docs.
    // - Creates termsets (one or more arrays of termids) from document text.
    // - Tallies frequency of termids against current frequencies compiling a
    //   final in-memory frequency count of all terms involved with this set of
    //   documents to be indexed.
    // - Stores new frequencies.
    if (TIMER) console.time('update:freq');
    try {
        var freq = generateFrequency(docs, source._geocoder.token_replacer);
    } catch(err) {
        return callback(err);
    }
    if (TIMER) console.timeEnd('update:freq');

    // Do this within each shard worker.
    var getter = source.getGeocoderData.bind(source);

    // Ensures all shards are loaded.
    if (TIMER) console.time('update:loadall');
    var ids = Object.keys(freq).map(function(v) { return parseInt(v, 10); });

    source._geocoder.updateFreqs(getter, ids, freq, function(err) {
        if (TIMER) console.timeEnd('update:loadall');
        if (TIMER) console.time('update:indexdocs');
        indexdocs(docs, freq, zoom, source._geocoder.geocoder_tokens, updateCache);
    });

    function updateCache(err, patch) {
        if (err) return callback(err);
        if (TIMER) console.timeEnd('update:indexdocs');

        // ? Do this in master?
        var features = {};
        var q = queue(500);
        q.defer(function(features, callback) {
            if (TIMER) console.time('update:putFeatures');
            feature.putFeatures(source, cleanDocs(source, patch.docs), function(err) {
                if (TIMER) console.timeEnd('update:putFeatures');
                if (err) return callback(err);
                // @TODO manually calls _commit on MBTiles sources.
                // This ensures features are persisted to the store for the
                // next run which would not necessarily be the case without.
                // Given that this is a very performant pattern, commit may
                // be worth making a public function in node-mbtiles (?).
                return source._commit ? source._commit(callback) : callback();
            });
        }, features);
        if (patch.grid) {
            var cache = source._geocoder;
            q.defer(function(data, callback) {
                var ids = Object.keys(data);
                var cache = source._geocoder;
                if (TIMER) console.time('update:setGridParts');
                cache.setGridParts(getter, data, function(err) {
                    if (TIMER) console.timeEnd('update:setGridParts');
                    callback();
                });
            }, patch.grid);
        }
        q.awaitAll(callback);
    }
}

function generateFrequency(docs, replacer) {
    var freq = {};

    // Uses freq[0] as a convention for storing total # of docs.
    // Reserved for this use by termops.encodeTerm
    freq[0] = [0];

    // Uses freq[1] as a convention for storing max score.
    // Reserved for this use by termops.encodeTerm
    freq[1] = [0];

    for (var i = 0; i < docs.length; i++) {
        if (!docs[i].properties["carmen:text"]) {
            throw new Error('doc has no carmen:text');
        }

        // set max score
        freq[1][0] = Math.max(freq[1][0], docs[i].properties["carmen:score"] || 0);

        var texts = termops.getIndexableText(replacer, docs[i]);
        for (var x = 0; x < texts.length; x++) {
            var terms = termops.terms(texts[x]);
            for (var k = 0; k < terms.length; k++) {
                var id = terms[k];
                freq[id] = freq[id] || [0];
                freq[id][0]++;
                freq[0][0]++;
            }
        }
    }

    return freq;
}

function store(source, callback) {
    return source._geocoder.store(source, callback);
}

// Cleans a doc for storage based on source properties.
// Currently only drops _geometry data for non interpolated
// address sources.
function cleanDocs(source, docs) {
    for (var i = 0; i < docs.length; i++) {
        // source is not address enabled
        if (!source._geocoder.geocoder_address) {
            delete docs[i].geometry;
        }
    }
    return docs;
}

// Kill all child process workers.
function teardown() {
    indexdocs.teardown();
}
