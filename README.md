[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![CircleCI](https://circleci.com/gh/Jaspero/ng-slider/tree/master.svg?style=svg)](https://circleci.com/gh/Jaspero/ng-slider/tree/master)
[![NPM Version](https://img.shields.io/npm/v/@jaspero/ng-slider.svg)](https://www.npmjs.com/package/@jaspero/ng-slider)

# NG Slider
A slider library for Angular

## Installation

To install this library, run:

```bash
$ npm install --save @jaspero/ng-slider
```

## Caveats

- If hammer is enabled and you need click events in a slide use `(tap)` instead of `(click)`.
  Hammer has a bug where it registers the click event after pan ends, there are a lot of issues
  documenting this behaviour, here is one example:
  https://github.com/hammerjs/hammer.js/issues/815

## License

MIT © [Jaspero co.](mailto:info@jaspero.co)
