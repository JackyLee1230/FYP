var stats = {
    type: "GROUP",
name: "All Requests",
path: "",
pathFormatted: "group_missing-name-b06d1",
stats: {
    "name": "All Requests",
    "numberOfRequests": {
        "total": "5",
        "ok": "0",
        "ko": "5"
    },
    "minResponseTime": {
        "total": "17",
        "ok": "-",
        "ko": "17"
    },
    "maxResponseTime": {
        "total": "51",
        "ok": "-",
        "ko": "51"
    },
    "meanResponseTime": {
        "total": "26",
        "ok": "-",
        "ko": "26"
    },
    "standardDeviation": {
        "total": "13",
        "ok": "-",
        "ko": "13"
    },
    "percentiles1": {
        "total": "22",
        "ok": "-",
        "ko": "22"
    },
    "percentiles2": {
        "total": "23",
        "ok": "-",
        "ko": "23"
    },
    "percentiles3": {
        "total": "45",
        "ok": "-",
        "ko": "45"
    },
    "percentiles4": {
        "total": "50",
        "ok": "-",
        "ko": "50"
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
    "count": 0,
    "percentage": 0
},
    "group4": {
    "name": "failed",
    "htmlName": "failed",
    "count": 5,
    "percentage": 100
},
    "meanNumberOfRequestsPerSecond": {
        "total": "0.455",
        "ok": "-",
        "ko": "0.455"
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
        "total": "5",
        "ok": "0",
        "ko": "5"
    },
    "minResponseTime": {
        "total": "17",
        "ok": "-",
        "ko": "17"
    },
    "maxResponseTime": {
        "total": "51",
        "ok": "-",
        "ko": "51"
    },
    "meanResponseTime": {
        "total": "26",
        "ok": "-",
        "ko": "26"
    },
    "standardDeviation": {
        "total": "13",
        "ok": "-",
        "ko": "13"
    },
    "percentiles1": {
        "total": "22",
        "ok": "-",
        "ko": "22"
    },
    "percentiles2": {
        "total": "23",
        "ok": "-",
        "ko": "23"
    },
    "percentiles3": {
        "total": "45",
        "ok": "-",
        "ko": "45"
    },
    "percentiles4": {
        "total": "50",
        "ok": "-",
        "ko": "50"
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
    "count": 0,
    "percentage": 0
},
    "group4": {
    "name": "failed",
    "htmlName": "failed",
    "count": 5,
    "percentage": 100
},
    "meanNumberOfRequestsPerSecond": {
        "total": "0.455",
        "ok": "-",
        "ko": "0.455"
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
