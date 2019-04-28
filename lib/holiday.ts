import { get, Request } from 'request';
import * as moment from 'moment-timezone';

const NEW_LINE = /\r\n|\n/;
const SOURCE_URL = 'http://apps.employment.govt.nz/ical/public-holidays-all.ics';
const CATEGORIES = {
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

interface Holiday {
    date: string;
    name: string;
    region: string;
    category: string;
}

function convert(str: string): any {
    let key = '';
    let value = '';
    let response = {};
    let parent = {};
    let lines = str.split(NEW_LINE);
    let that = response;
    let parents = [];
    let splitLength, i, line;
    for (i in lines) {
        line = lines[i];
        if (line.charAt(0) === ' ') {
            that[key] += line.substr(1);
        } else {
            splitLength = line.indexOf(':');
            if (!splitLength) continue;

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
                    } else
                        that[key] = value;
            }
        }
    }
    return response;
}

function sortDates(a: { date: string|number }, b: { date: string|number }): number {
    return new Date(a.date).getTime() -
        new Date(b.date).getTime();
}

function getCategory(name: string): string {
    let lower = name.toLowerCase();
    for (let i in CATEGORIES) {
        if (lower.search(i) + 1) return CATEGORIES[i];
    }
    return 'Anniversary';
}

function getRegion(name: string): string {
    let lower = name.toLowerCase();
    let selection = Object.entries(REGIONS).filter(([label]) => {
        return label.split('; ').every((value) => {
            return lower.search(value) + 1 ? true : false;
        });
    });
    if (selection.length) return selection[0][1];
    return 'All';
}

function simplify(result: { VCALENDAR: { VEVENT: object; }[]; }): Holiday[] {
    let cursor = result.VCALENDAR[0].VEVENT;
    return Object.entries(cursor).map(([key, value]) => {
        let date = moment(value['DTSTART;VALUE=DATE']).tz('Pacific/Auckland').format('YYYY-MM-DD');
        let name = value['SUMMARY;LANGUAGE=en-nz'] || value['SUMMARY;LANGUAGE=en-us'];
        let region = getRegion(name);
        let category = getCategory(name);
        return { date, name, region, category };
    }).sort(sortDates);
}

type HolidayDataCallback = (error?: Error, data?: Holiday[]) => void;

function getHolidayData(callback: HolidayDataCallback): void {
    get(SOURCE_URL, (error, response, body: string) => {
        if (error) return callback(error);
        let data = convert(body);
        if (!data) return callback(new Error('iCal response could not be parsed to JSON'));
        return callback(null, simplify(data));
    });
}

module.exports = getHolidayData;