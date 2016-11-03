var unidecode = require('unidecode-cxx');
var XRegExp = require('xregexp');

module.exports.createReplacer = function(tokens) {
    var replacers = [];

    for (var token in tokens) {
        var from = token; // normalize expanded
        var to = tokens[token];

        var entry = [];
        var parsedFrom = new XRegExp(from);
        var named = (parsedFrom.xregexp.captureNames !== null);

        // ensure that named groups are all or nothing; otherwise we have order problems
        if (named && parsedFrom.xregexp.captureNames.some(function(captureName) { return captureName === null; }))
            throw new Error('Cannot process \'%s\'; must use either named or numbered capture groups, not both', from);

        for (var u = 0; u < 2; u++) {
            if (u) {
                var unidecoded = unidecode(from);
                if (from === unidecoded) {
                    continue;
                } else {
                    from = unidecoded;
                }
            }

            if (named) {
                entry.push({
                    named: true,
                    from: new XRegExp('^' + from + '$', 'gi'),
                    to: to 
                });
                entry.push({
                    named: true,
                    from: new XRegExp('^' + to + '$', 'gi'),
                    to: from
                });
            } else if (!to) {
                entry.push({
                    named: false,
                    from: new RegExp('^' + from + '$', 'gi'),
                    to: ''
                });
            } else {
                entry.push({
                    named: false,
                    from: new RegExp('^' + from + '$', 'gi'),
                    to: to
                });
                entry.push({
                    named: false,
                    from: new RegExp('^' + to + '$', 'gi'),
                    to: from
                });
            }
        }
        replacers.push(entry);
    }

    // Create additional replacers to handle replacer transitivity
    // if there are replacers a => b and b => c then create replacer a => c
    var transitiveReplacers = [];
    for (var i = 0; i < replacers.length; i++) {
        var replacerPair = replacers[i];
        var length = transitiveReplacers.length;
        for (var k = 0; k < length; k++) {
            var replacer = transitiveReplacers[k];
            for (var a = 0; a < replacerPair.length; a++) {
                var merged = mergeReplacer(replacerPair[a], replacer) || mergeReplacer(replacer, replacerPair[a]);
                if (merged) transitiveReplacers.push(merged);
            }
        }
        for (var r = 0; r < replacers[i].length; r++) {
            transitiveReplacers.push(replacers[i][r]);
        }
    }
    return transitiveReplacers;
};

function mergeReplacer(replacerA, replacerB) {
    if (replacerA.named ? XRegExp(replacerA.from).test(replacerB.to) : replacerA.from.test(replacerB.to)) {
        return {
            named: replacerB.named,
            from: replacerB.from,
            to: replacerA.to
        };
    }
}

module.exports.replaceToken = replaceToken;
function replaceToken(tokens, query) {
    var abbr = query;
    for (var i=0; i<tokens.length; i++) {
        abbr = replaceSingleToken(tokens[i], abbr);
    }

    return abbr;
}

function replaceSingleToken(token, query) {
    if (token.named) {
        return XRegExp.replace(query, token.from, token.to);
    } else {
        return query.replace(token.from, token.to);
    }
}

module.exports.normalize = normalize;
function normalize(query) {
    return query.toLowerCase()
        .replace(/[\^]+/g, '')
        // collapse apostraphes, periods
        .replace(/['\.]/g, '');
}

module.exports.getQueryTokenVariations = function(replacers, queryTokens) {
    var queryWithTokenVariations = [queryTokens];
    for (var i = 0; i < queryTokens.length; i++) {
        var queryToken = queryTokens[i];
        var length = queryWithTokenVariations.length;

        var variations = [];
        for (var k = 0; k < replacers.length; k++) {
            var variation = normalize(replaceSingleToken(replacers[k], queryToken));
            if (variation !== queryToken) {
                variations.push(variation);
            }
        }

        for (var v = 0; v < variations.length; v++) {
            for (var c = 0; c < length; c++) {
                var copy = queryWithTokenVariations[c].slice();
                copy[i] = variations[v];
                queryWithTokenVariations.push(copy);
            }
        }
    }
    return queryWithTokenVariations;
}

module.exports.createGlobalReplacer = function(tokens) {
    var replacers = [];

    for (var token in tokens) {
        var from = token;
        var to = tokens[token];
        
        var entry = {
            named: false,
            from: new RegExp(from, 'gi'),
            to: to
        };
        replacers.push(entry);
    }
    return replacers;
}
