# NZ Public Holidays

Gets dates and details for New Zealand public holidays.
Uses [this](http://apps.employment.govt.nz/ical/public-holidays-all.ics) government resource as the source.

## Usage

```js
var holidays = require('nz-public-holidays');
var options = { // nullable
    // public holidays after this date
    after: '2017-12-31',
    // public holidays before this date
    before: '2019-01-01',
    // return null for non-region specific holidays
    nulls: true 
};

holidays(options, function(error, result) {
    if (error) console.log(error);
    console.log(result[0], result[result.length - 1]);
});

holidays(null, function(error, result) {
    if (error) console.log(error);
    console.log(result[0], result[result.length - 1]);
});
```