"use strict";
exports.__esModule = true;
var request_1 = require("request");
var moment = require("moment-timezone");
var NEW_LINE = /\r\n|\n/;
var SOURCE_URL = 'http://apps.employment.govt.nz/ical/public-holidays-all.ics';
var CATEGORIES = {
    'new': 'New Year\'s Day',
    'day after': 'Day after New Year\'s Day',
    'waitangi': 'Waitangi Day',
    'good': 'Good Friday',
    'easter': 'Easter Monday',
    'anzac': 'ANZAC Day',
    'queen': 'Queen\'s Birthday',
    'labour': 'Labour Day',
    'christmas': 'Christmas Day',
    'boxing': 'Boxing Day'
};
var REGIONS = {
    'northland': 'Northland',
    'auckland': 'Auckland',
    'taranaki': 'Taranaki',
    'hawke; bay': 'Hawke\'s Bay',
    'wellington': 'Wellington',
    'marlborough': 'Marlborough',
    'nelson': 'Nelson',
    'buller': 'Buller',
    'south; caterbury': 'South Canterbury',
    'canterbury': 'Canterbury',
    'westland': 'Westland',
    'otago': 'Otago',
    'southland': 'Southland',
    'chatham; island': 'Chatham Islands'
};
function convert(str) {
    var key = '';
    var value = '';
    var response = {};
    var parent = {};
    var lines = str.split(NEW_LINE);
    var that = response;
    var parents = [];
    var splitLength, i, line;
    for (i in lines) {
        line = lines[i];
        if (line.charAt(0) === ' ') {
            that[key] += line.substr(1);
        }
        else {
            splitLength = line.indexOf(':');
            if (!splitLength)
                continue;
            key = line.substr(0, splitLength);
            value = line.substr(splitLength + 1);
            switch (key) {
                case 'BEGIN':
                    parents.push(parent);
                    parent = that;
                    if (!parent[value])
                        parent[value] = [];
                    that = {};
                    parent[value].push(that);
                    break;
                case 'END':
                    that = parent;
                    parent = parents.pop();
                    break;
                default:
                    if (that[key]) {
                        if (!Array.isArray(that[key]))
                            that[key] = [that[key]];
                        that[key].push(value);
                    }
                    else
                        that[key] = value;
            }
        }
    }
    return response;
}
function sortDates(a, b) {
    return new Date(a.date).getTime() -
        new Date(b.date).getTime();
}
function getCategory(name) {
    var lower = name.toLowerCase();
    for (var i in CATEGORIES) {
        if (lower.search(i) + 1)
            return CATEGORIES[i];
    }
    return 'Anniversary';
}
function getRegion(name) {
    var lower = name.toLowerCase();
    var selection = Object.entries(REGIONS).filter(function (_a) {
        var label = _a[0];
        return label.split('; ').every(function (value) {
            return lower.search(value) + 1 ? true : false;
        });
    });
    if (selection.length)
        return selection[0][1];
    return 'All';
}
function simplify(result) {
    var cursor = result.VCALENDAR[0].VEVENT;
    return Object.entries(cursor).map(function (_a) {
        var key = _a[0], value = _a[1];
        var date = moment(value['DTSTART;VALUE=DATE']).tz('Pacific/Auckland').format('YYYY-MM-DD');
        var name = value['SUMMARY;LANGUAGE=en-nz'] || value['SUMMARY;LANGUAGE=en-us'];
        var region = getRegion(name);
        var category = getCategory(name);
        return { date: date, name: name, region: region, category: category };
    }).sort(sortDates);
}
function getHolidayData(callback) {
    return request_1.get(SOURCE_URL, function (error, response, body) {
        if (error)
            return callback(error);
        var data = convert(body);
        if (!data)
            return callback(new Error('iCal response could not be parsed to JSON'));
        return callback(null, simplify(data));
    });
}
exports.getHolidayData = getHolidayData;
