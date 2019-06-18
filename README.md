<h1 align="center">Welcome to nz-public-holidays 👋</h1>
<p>
  <img src="https://img.shields.io/badge/version-1.1.5-blue.svg?cacheSeconds=2592000" />
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
npm install
```

## Usage

```js
const holidays = require('nz-public-holidays');

holidays((error, result) => {
    if (error) console.log(error);
    console.log(result[0], result[result.length - 1]);
});
```

## Author

👤 **Tomas van der Wel**

* Github: [@Tomasvanderwel](https://github.com/Tomasvanderwel)

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2019 [Tomas van der Wel](https://github.com/Tomasvanderwel).<br />
This project is [MIT](https://github.com/Tomasvanderwel/nz-public-holiday/blob/master/LICENSE) licensed.