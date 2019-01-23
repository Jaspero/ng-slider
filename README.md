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

## Setup

Import `JpSliderModule` in to your `@NgModule`:

```ts
@NgModule({
    imports: [
        JpSliderModule
    ],
    ...
})
export class AppModule {}
```

You can also provide default slider [configuration options](#options)
when importing the module

```ts
@NgModule({
    imports: [
        JpSliderModule.defaultOptions(options)
    ],
    ...
})
```

Now you can use the slider in your components like this:

```html
<jp-slider [options]="options">
  <jp-slides>
    <jp-slide>
      <h1>Slide 1</h1>
      <p>Content 1</p>
    </jp-slide>
    <jp-slide>
      <h1>Slide 2</h1>
      <p>Content 2</p>
    </jp-slide>
  </jp-slides>
  <jp-slide-pagination></jp-slide-pagination>
  <button jpSlideArrow="left">Left</button>
  <button jpSlideArrow="right">Right</button>
</jp-slider>
```

## Configuration

### Options

You can provide default global options when importing the slider module `JpSliderModule.defaultOptions(options)`
or on the `jp-slider` component `<jp-slider [options]="options">`. Options provided through the component
input are merged with default options with component options overriding the default ones.

| name          | type    | default | description                                                                                  |
| ------------- | ------- | ------- | -------------------------------------------------------------------------------------------- |
| blocksPerView | number  | 1       | how many slides should be shown per view                                                     |
| slideTime     | number  | 0       | on what interval should the slider auto slide (disabled if 0)                                |
| movesPerClick | number  | 1       | how many slides should be moved per click on the jpSlideArrow directive                      |
| initialSlide  | number  | 0       | index of the first slide that should be in view when the component inits                     |
| loop          | boolean | true    | should the slider loop (clicking on the last slide takes you to the first one and vice versa |

### Events

### Customization

The library ships with bare minimum styles. This is all there is to it:

```scss
// jp-slider component
:host {
  display: block;
  height: 100%;
  width: 100%;
}

.jp-s-w {
  position: relative;
  overflow: hidden;
  height: 100%;
  width: 100%;
}

.jp-s-w-i {
  position: relative;
  height: 100%;
  display: flex;
  transition: 0s;
  &.active {
    transition: 0.3s;
  }
}
```

This is to allow for all kinds of customizations, with the downside being
that no styles are provided out of the box.

## Caveats

- If hammer is enabled and you need click events in a slide use `(tap)` instead of `(click)`.
  Hammer has a bug where it registers the click event after pan ends, there are a lot of issues
  documenting this behaviour, here is one example:
  https://github.com/hammerjs/hammer.js/issues/815

## License

MIT © [Jaspero co.](mailto:info@jaspero.co)
