"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var axios_1 = require("axios");
var moment = require("moment-timezone");
var util_1 = require("util");
var get = axios_1["default"].get;
var getCallback = util_1.callbackify(get);
var NEW_LINE = /\r\n|\n/;
var SOURCE_URL = 'http://apps.employment.govt.nz/ical/public-holidays-all.ics';
var CATEGORIES = {
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
function iCalToJSO(raw) {
    var key = '';
    var block = '';
    var response = {};
    var parent = {};
    var lines = raw.split(NEW_LINE);
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
        return label.split('; ').find(function (value) {
            return lower.search(value) + 1 ? true : false;
        });
    });
    var region = selection.length ? selection[0][1] : 'All';
    return region;
}
function getName(value) {
    var name = (value['SUMMARY;LANGUAGE=en-nz'] || value['SUMMARY;LANGUAGE=en-us']);
    if (typeof value[''] === 'string')
        return name + value[''].substr(1);
    if (!value[''] || !Array.isArray(value['']))
        return name;
    var item = value[''][0];
    if (/^\t[A-Z\d]{41}$/.test(item) === false &&
        /^\tidaydates/.test(item) === false)
        return name + item.substr(1);
    return name;
}
function getObservance(name) {
    return /not/.test(name);
}
function simplify(result) {
    var cursor = result.VCALENDAR[0].VEVENT;
    return Object.entries(cursor).map(function (_a) {
        var key = _a[0], value = _a[1];
        var date = moment(value['DTSTART;VALUE=DATE'])
            .tz('Pacific/Auckland').format('YYYY-MM-DD');
        var name = getName(value);
        var region = getRegion(name);
        var category = getCategory(name);
        var observedByWeekendWorker = getObservance(name);
        return { date: date, name: name, region: region, category: category, observedByWeekendWorker: observedByWeekendWorker };
    }).sort(sortDates);
}
function getHolidayData(callback) {
    var _this = this;
    if (callback)
        return getCallback(SOURCE_URL, null, function (error, response) {
            if (error)
                return callback(error);
            var data = iCalToJSO(response.data);
            if (!data)
                return callback(new Error('iCal response could not be parsed to JSO'));
            return callback(null, simplify(data));
        });
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1["default"].get(SOURCE_URL)];
                case 1:
                    response = _a.sent();
                    data = iCalToJSO(response.data);
                    if (!data)
                        return [2 /*return*/, reject(new Error('iCal response could not be parsed to JSO'))];
                    return [2 /*return*/, resolve(simplify(data))];
                case 2:
                    error_1 = _a.sent();
                    return [2 /*return*/, reject(error_1)];
                case 3: return [2 /*return*/];
            }
        });
    }); });
}
exports.getHolidayData = getHolidayData;
