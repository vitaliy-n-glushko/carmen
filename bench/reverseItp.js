var Benchmark = require('benchmark'),
    suite = new Benchmark.Suite();
var address = require('../lib/pure/applyaddress');

var bytes = require('bytes');

console.log(bytes(process.memoryUsage().rss));

console.time('Reversing Address Itp');
address.reverse(
    {
        "properties": {
            "carmen:center":[-77.031953,38.919952],"id":75018674165319,
            "carmen:lfromhn":["1618","2750","3000","3022","2900","1700","1624","","1600","2300","2800","2512","2400","2000","1924","1800","1820","2450","2100","2524","2500","1900","2700","2200","","1720","2600"],
            "carmen:ltohn":["1620","2798","3020","3098","2998","1718","1698","","1616","2398","2898","2522","2448","2098","1998","1818","1898","2498","2198","2598","2510","1922","2748","2298","","1798","2698"],
            "carmen:parityl":["E","E","E","E","E","E","E","","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","","E","E"],"carmen:parityr":["O","O","O","O","O","O","","O","O","O","O","O","O","O","O","O","O","O","O","O","O","O","O","O","O","O","O"],
            "carmen:rangetype":"tiger",
            "carmen:rfromhn":["1623","2701","3001","3033","2851","1701","","2751","1601","2301","2801","2501","2351","2001","1921","1801","1825","2401","2101","2511","2427","1901","2651","2201","2565","1721","2601"],
            "carmen:rtohn":["1699","2749","3031","3099","2999","1719","","2799","1621","2349","2849","2509","2399","2099","1999","1823","1899","2425","2199","2563","2499","1919","2699","2299","2599","1799","2649"],
            "carmen:rtohn":["1699","2749","3031","3099","2999","1719","","2799","1621","2349","2849","2509","2399","2099","1999","1823","1899","2425","2199","2563","2499","1919","2699","2299","2599","1799","2649"],
            "carmen:text":"14th St NW","abbrname":"14th St NW","_bbox":[-77.03261199999999,38.91112899999999,-77.03183899999996,38.92880499999998],
            "carmen:zxy":["14/4686/6266","14/4686/6265"],
            "carmen:extid":"addressitp.75018674165319",
            "carmen:tmpid":323909959
        },
        "geometry":{"type":"MultiLineString","coordinates":[[[-77.031949,38.911868],[-77.031953,38.912606]],[[-77.032242,38.924756],[-77.03225,38.924827],[-77.032309,38.925424],[-77.032316,38.925502]],[[-77.032518,38.927538],[-77.03259,38.928533]],[[-77.03259,38.928533],[-77.032612,38.928805]],[[-77.032407,38.926573],[-77.032518,38.927538]],[[-77.031953,38.912606],[-77.031952,38.913349]],[[-77.031949,38.911868],[-77.031953,38.912606]],[[-77.032316,38.925502],[-77.032331,38.925652],[-77.032339,38.925742]],[[-77.031952,38.911129],[-77.031949,38.911868]],[[-77.031941,38.920064],[-77.031932,38.920106],[-77.031866,38.920322],[-77.031853,38.920416],[-77.031844,38.920511],[-77.031841,38.920556],[-77.03184,38.920601]],[[-77.032339,38.925742],[-77.032407,38.926573]],[[-77.03201,38.922428],[-77.032038,38.922686]],[[-77.03184,38.920601],[-77.031839,38.92064],[-77.031839,38.92068],[-77.031841,38.920756],[-77.031865,38.920998],[-77.031873,38.921086]],[[-77.031951,38.916998],[-77.031952,38.918112]],[[-77.031952,38.916289],[-77.031951,38.916372],[-77.031951,38.916998]],[[-77.031951,38.914094],[-77.031952,38.91418],[-77.031953,38.91448],[-77.031952,38.914831]],[[-77.031952,38.914831],[-77.031952,38.915262],[-77.031956,38.915568]],[[-77.031873,38.921086],[-77.03193,38.92166]],[[-77.031952,38.918112],[-77.031951,38.919185]],[[-77.032038,38.922686],[-77.032072,38.923012],[-77.032132,38.923635]],[[-77.03193,38.92166],[-77.032002,38.922342],[-77.03201,38.922428]],[[-77.031956,38.915568],[-77.031952,38.916289]],[[-77.03222,38.924541],[-77.032242,38.924756]],[[-77.031951,38.919185],[-77.031952,38.919267],[-77.031953,38.919952],[-77.031952,38.919976],[-77.031948,38.92002],[-77.031941,38.920064]],[[-77.032132,38.923635],[-77.032143,38.923763]],[[-77.031952,38.913349],[-77.031954,38.913703],[-77.031951,38.914094]],[[-77.032143,38.923763],[-77.032193,38.924284],[-77.03222,38.924541]]]},
    },
    [-77.03210145235062,38.91391005208429]);
console.timeEnd('Reversing Address Itp');
console.log(bytes(process.memoryUsage().rss));
