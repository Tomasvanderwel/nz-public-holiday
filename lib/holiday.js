"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = require("request");
const moment = require("moment-timezone");
const NEW_LINE = /\r\n|\n/;
const SOURCE_URL = 'http://apps.employment.govt.nz/ical/public-holidays-all.ics';
const CATEGORIES = {
    'day after': 'Day after New Year\'s Day',
    'new': 'New Year\'s Day',
    'waitangi': 'Waitangi Day',
    'good': 'Good Friday',
    'easter': 'Easter Monday',
    'anzac': 'ANZAC Day',
    'queen': 'Queen\'s Birthday',
    'labour': 'Labour Day',
    'christmas': 'Christmas Day',
    'boxing': 'Boxing Day'
};
const REGIONS = {
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
function iCalToJSO(raw) {
    let key = '';
    let block = '';
    let response = {};
    let parent = {};
    const lines = raw.split(NEW_LINE);
    let that = response;
    let parents = [];
    let splitLength, i, line;
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
            block = line.substr(splitLength + 1);
            switch (key) {
                case 'BEGIN':
                    parents.push(parent);
                    parent = that;
                    parent[block] = parent[block] ? parent[block] : [];
                    that = {};
                    parent[block].push(that);
                    break;
                case 'END':
                    that = parent;
                    parent = parents.pop();
                    break;
                default:
                    if (that[key]) {
                        if (!Array.isArray(that[key]))
                            that[key] = [that[key]];
                        that[key].push(block);
                    }
                    else
                        that[key] = block;
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
    const lower = name.toLowerCase();
    for (let i in CATEGORIES) {
        if (lower.search(i) + 1)
            return CATEGORIES[i];
    }
    return 'Anniversary';
}
function getRegion(name) {
    const lower = name.toLowerCase();
    const selection = Object.entries(REGIONS).filter(([label]) => {
        return label.split('; ').find((value) => {
            return lower.search(value) + 1 ? true : false;
        });
    });
    const region = selection.length ? selection[0][1] : 'All';
    return region;
}
function getName(value) {
    let name = (value['SUMMARY;LANGUAGE=en-nz'] || value['SUMMARY;LANGUAGE=en-us']);
    if (typeof value[''] === 'string')
        return name + value[''].substr(1);
    if (!value[''] || !Array.isArray(value['']))
        return name;
    let item = value[''][0];
    if (/^\t[A-Z\d]{41}$/.test(item) === false &&
        /^\tidaydates/.test(item) === false)
        return name + item.substr(1);
    return name;
}
function getWeekendWorkerObservance(name) {
    return /not/.test(name);
}
function simplify(result) {
    const cursor = result.VCALENDAR[0].VEVENT;
    return Object.entries(cursor).map(([key, value]) => {
        const date = moment(value['DTSTART;VALUE=DATE'])
            .tz('Pacific/Auckland').format('YYYY-MM-DD');
        const name = getName(value);
        const region = getRegion(name);
        const category = getCategory(name);
        const observedByWeekendWorker = getWeekendWorkerObservance(name);
        return { date, name, region, category, observedByWeekendWorker };
    }).sort(sortDates);
}
function getHolidayData(callback) {
    request_1.get(SOURCE_URL, (error, response, body) => {
        if (error)
            return callback(error);
        const data = iCalToJSO(body);
        if (!data)
            return callback(new Error('iCal response could not be parsed to JSO'));
        return callback(null, simplify(data));
    });
}
exports.getHolidayData = getHolidayData;
