import axios, { AxiosResponse } from 'axios';
import * as moment from 'moment-timezone';
import { callbackify } from 'util';

type GetCallback = (uri: string, opts: any, callback: (error?: Error, response?: AxiosResponse<any>) => void) => void;
const { get } = axios;
const getCallback: GetCallback = callbackify(get);

type Region = 'Northland'|'Auckland'|'Taranaki'|'Hawke\'s Bay'|'Wellington'|'Marlborough'|'Nelson'|'Buller'|'South Canterbury'|'Canterbury'|'Westland'|'Otago'|'Southland'|'Chatham Islands'|'All';
type Category = 'New Year\'s Day'|'Day after New Year\'s Day'|'Waitangi Day'|'Good Friday'|'Easter Monday'|'ANZAC Day'|'Queen\'s Birthday'|'Labour Day'|'Christmas Day'|'Boxing Day'|'Anniversary';
interface Generic { [key: string]: any; }
interface CalendarData { VCALENDAR: { VEVENT: Generic; }[]; }
interface Holiday {
    date: string;
    name: string;
    region: Region;
    category: Category;
    observedByWeekendWorker: boolean;
}
type HolidayDataCallback = (error?: Error, data?: Holiday[]) => void;

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
const REGIONS: { [name: string]: Region } = {
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

function iCalToJSO(raw: string): any {
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
        } else {
            splitLength = line.indexOf(':');
            if (!splitLength) continue;

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
                    } else
                        that[key] = block;
            }
        }
    }
    return response;
}

function sortDates(a: { date: string|number }, b: { date: string|number }): number {
    return new Date(a.date).getTime() -
        new Date(b.date).getTime();
}

function getCategory(name: string): Category {
    const lower = name.toLowerCase();
    for (let i in CATEGORIES) {
        if (lower.search(i) + 1) return CATEGORIES[i];
    }
    return 'Anniversary';
}

function getRegion(name: string): Region {
    const lower = name.toLowerCase();
    const selection = Object.entries(REGIONS).filter(([label]) => {
        return label.split('; ').find((value) => {
            return lower.search(value) + 1 ? true : false;
        });
    });
    const region: Region = selection.length ? selection[0][1] : 'All';
    return region;
}

function getName(value: Generic): string {
    let name = (value['SUMMARY;LANGUAGE=en-nz'] || value['SUMMARY;LANGUAGE=en-us']);
    if (typeof value[''] === 'string') return name + value[''].substr(1);
    if (!value[''] || !Array.isArray(value[''])) return name;
    let item = value[''][0];
    if (/^\t[A-Z\d]{41}$/.test(item) === false &&
        /^\tidaydates/.test(item) === false) return name + item.substr(1);
    return name;
}

function getObservance(name: string): boolean {
    return /not/.test(name);
}

function simplify(result: CalendarData): Holiday[] {
    const cursor = result.VCALENDAR[0].VEVENT;
    return Object.entries(cursor).map(([key, value]) => {
        const date = moment(value['DTSTART;VALUE=DATE'])
            .tz('Pacific/Auckland').format('YYYY-MM-DD');
        const name = getName(value);
        const region: Region = getRegion(name);
        const category: Category = getCategory(name);
        const observedByWeekendWorker = getObservance(name);
        return { date, name, region, category, observedByWeekendWorker };
    }).sort(sortDates);
}

export function getHolidayData(): Promise<Holiday[]>;
export function getHolidayData(callback: HolidayDataCallback): void;
export function getHolidayData(callback?: HolidayDataCallback): void|Promise<Holiday[]> {
    if (callback) return getCallback(SOURCE_URL, null, (error, response) => {
        if (error) return callback(error);
        const data: CalendarData = iCalToJSO(response.data);
        if (!data) return callback(new Error('iCal response could not be parsed to JSO'));
        return callback(null, simplify(data));
    });
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios.get(SOURCE_URL);
            const data: CalendarData = iCalToJSO(response.data);
            if (!data) return reject(new Error('iCal response could not be parsed to JSO'));
            return resolve(simplify(data));
        } catch (error) {
            return reject(error);
        }
    });
}
