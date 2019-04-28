# NZ Public Holidays

Gets dates and details for New Zealand public holidays.
Uses [this](http://apps.employment.govt.nz/ical/public-holidays-all.ics) government resource as the source.

## Usage

```js
const holidays = require('nz-public-holidays');

holidays((error, result) => {
    if (error) console.log(error);
    console.log(result[0], result[result.length - 1]);
});
```