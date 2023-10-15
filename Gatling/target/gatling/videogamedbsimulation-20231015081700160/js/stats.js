var stats = {
    type: "GROUP",
name: "All Requests",
path: "",
pathFormatted: "group_missing-name-b06d1",
stats: {
    "name": "All Requests",
    "numberOfRequests": {
        "total": "50",
        "ok": "50",
        "ko": "0"
    },
    "minResponseTime": {
        "total": "5460",
        "ok": "5460",
        "ko": "-"
    },
    "maxResponseTime": {
        "total": "21313",
        "ok": "21313",
        "ko": "-"
    },
    "meanResponseTime": {
        "total": "12515",
        "ok": "12515",
        "ko": "-"
    },
    "standardDeviation": {
        "total": "5175",
        "ok": "5175",
        "ko": "-"
    },
    "percentiles1": {
        "total": "11684",
        "ok": "11684",
        "ko": "-"
    },
    "percentiles2": {
        "total": "17522",
        "ok": "17522",
        "ko": "-"
    },
    "percentiles3": {
        "total": "20500",
        "ok": "20500",
        "ko": "-"
    },
    "percentiles4": {
        "total": "21117",
        "ok": "21117",
        "ko": "-"
    },
    "group1": {
    "name": "t < 800 ms",
    "htmlName": "t < 800 ms",
    "count": 0,
    "percentage": 0
},
    "group2": {
    "name": "800 ms <= t < 1200 ms",
    "htmlName": "t ≥ 800 ms <br> t < 1200 ms",
    "count": 0,
    "percentage": 0
},
    "group3": {
    "name": "t ≥ 1200 ms",
    "htmlName": "t ≥ 1200 ms",
    "count": 50,
    "percentage": 100
},
    "group4": {
    "name": "failed",
    "htmlName": "failed",
    "count": 0,
    "percentage": 0
},
    "meanNumberOfRequestsPerSecond": {
        "total": "1.852",
        "ok": "1.852",
        "ko": "-"
    }
},
contents: {
"req_search-game-wit-2b833": {
        type: "REQUEST",
        name: "Search game with name",
path: "Search game with name",
pathFormatted: "req_search-game-wit-2b833",
stats: {
    "name": "Search game with name",
    "numberOfRequests": {
        "total": "50",
        "ok": "50",
        "ko": "0"
    },
    "minResponseTime": {
        "total": "5460",
        "ok": "5460",
        "ko": "-"
    },
    "maxResponseTime": {
        "total": "21313",
        "ok": "21313",
        "ko": "-"
    },
    "meanResponseTime": {
        "total": "12515",
        "ok": "12515",
        "ko": "-"
    },
    "standardDeviation": {
        "total": "5175",
        "ok": "5175",
        "ko": "-"
    },
    "percentiles1": {
        "total": "11684",
        "ok": "11684",
        "ko": "-"
    },
    "percentiles2": {
        "total": "17522",
        "ok": "17522",
        "ko": "-"
    },
    "percentiles3": {
        "total": "20500",
        "ok": "20500",
        "ko": "-"
    },
    "percentiles4": {
        "total": "21117",
        "ok": "21117",
        "ko": "-"
    },
    "group1": {
    "name": "t < 800 ms",
    "htmlName": "t < 800 ms",
    "count": 0,
    "percentage": 0
},
    "group2": {
    "name": "800 ms <= t < 1200 ms",
    "htmlName": "t ≥ 800 ms <br> t < 1200 ms",
    "count": 0,
    "percentage": 0
},
    "group3": {
    "name": "t ≥ 1200 ms",
    "htmlName": "t ≥ 1200 ms",
    "count": 50,
    "percentage": 100
},
    "group4": {
    "name": "failed",
    "htmlName": "failed",
    "count": 0,
    "percentage": 0
},
    "meanNumberOfRequestsPerSecond": {
        "total": "1.852",
        "ok": "1.852",
        "ko": "-"
    }
}
    }
}

}

function fillStats(stat){
    $("#numberOfRequests").append(stat.numberOfRequests.total);
    $("#numberOfRequestsOK").append(stat.numberOfRequests.ok);
    $("#numberOfRequestsKO").append(stat.numberOfRequests.ko);

    $("#minResponseTime").append(stat.minResponseTime.total);
    $("#minResponseTimeOK").append(stat.minResponseTime.ok);
    $("#minResponseTimeKO").append(stat.minResponseTime.ko);

    $("#maxResponseTime").append(stat.maxResponseTime.total);
    $("#maxResponseTimeOK").append(stat.maxResponseTime.ok);
    $("#maxResponseTimeKO").append(stat.maxResponseTime.ko);

    $("#meanResponseTime").append(stat.meanResponseTime.total);
    $("#meanResponseTimeOK").append(stat.meanResponseTime.ok);
    $("#meanResponseTimeKO").append(stat.meanResponseTime.ko);

    $("#standardDeviation").append(stat.standardDeviation.total);
    $("#standardDeviationOK").append(stat.standardDeviation.ok);
    $("#standardDeviationKO").append(stat.standardDeviation.ko);

    $("#percentiles1").append(stat.percentiles1.total);
    $("#percentiles1OK").append(stat.percentiles1.ok);
    $("#percentiles1KO").append(stat.percentiles1.ko);

    $("#percentiles2").append(stat.percentiles2.total);
    $("#percentiles2OK").append(stat.percentiles2.ok);
    $("#percentiles2KO").append(stat.percentiles2.ko);

    $("#percentiles3").append(stat.percentiles3.total);
    $("#percentiles3OK").append(stat.percentiles3.ok);
    $("#percentiles3KO").append(stat.percentiles3.ko);

    $("#percentiles4").append(stat.percentiles4.total);
    $("#percentiles4OK").append(stat.percentiles4.ok);
    $("#percentiles4KO").append(stat.percentiles4.ko);

    $("#meanNumberOfRequestsPerSecond").append(stat.meanNumberOfRequestsPerSecond.total);
    $("#meanNumberOfRequestsPerSecondOK").append(stat.meanNumberOfRequestsPerSecond.ok);
    $("#meanNumberOfRequestsPerSecondKO").append(stat.meanNumberOfRequestsPerSecond.ko);
}
