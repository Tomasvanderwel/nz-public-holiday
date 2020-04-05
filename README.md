<h1 align="center">Welcome to nz-public-holidays</h1>
<p>
  <img src="https://img.shields.io/badge/version-1.2.0-blue.svg?cacheSeconds=2592000" />
  <a href="https://github.com/Tomasvanderwel/nz-public-holiday#readme">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" target="_blank" />
  </a>
  <a href="https://github.com/Tomasvanderwel/nz-public-holiday/graphs/commit-activity">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" target="_blank" />
  </a>
  <a href="https://github.com/Tomasvanderwel/nz-public-holiday/blob/master/LICENSE">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" target="_blank" />
  </a>
</p>

> Produces dates and details for New Zealand public holidays. Uses [this](http://apps.employment.govt.nz/ical/public-holidays-all.ics) government .iCal as source. If this changes, please raise an issue.

## Install

```sh
npm install nz-public-holidays
```

## Usage

```js
const holidays = require('nz-public-holidays');

holidays((error, holidays) => {
    if (error) return console.error(error);
    console.log(...holidays.map((holiday) => {
      const { date, name, region, category, observedByWeekendWorker } = holiday;
      return `UPDATE tablename SET [HolidayName] = '${category}'` +
        `, [IsHoliday] = 1 WHERE [Date] = '${date}'`;
    }));
});
```

## Response Schema

| Column name | Type | Description |
|-------------------------|---------|-------------------------------------------------------|
| date | string | Date of holiday YYYY-MM-DD |
| name | string | Raw name of holiday |
| region | string | Name of applicable region |
| category | string | Standardised name of holiday |
| observedByWeekendWorker | boolean | If holiday is observed exclusively by weekend workers |

### Regions

Northland, Auckland, Taranaki, Hawke's Bay, Wellington, Marlborough, Nelson, Buller, South Canterbury, Canterbury, Westland, Otago, Southland, Chatham Islands, All

### Categories

New Year's Day, Day after New Year's Day, Waitangi Day, Good Friday, Easter Monday, ANZAC Day, Queen's Birthday, Labour Day, Christmas Day, Boxing Day, Anniversary (Region)

## Author

**Tomas van der Wel**

* Github: [@Tomasvanderwel](https://github.com/Tomasvanderwel)


## License

Copyright © 2019 [Tomas van der Wel](https://github.com/Tomasvanderwel).<br />
This project is [MIT](https://github.com/Tomasvanderwel/nz-public-holiday/blob/master/LICENSE) licensed.