import {CommonModule} from '@angular/common';
import {InjectionToken, ModuleWithProviders, NgModule} from '@angular/core';
import {DEFAULT_OPTIONS} from './consts/default-options.const';
import {SliderOptions} from './interfaces/slider-options.interface';
import {SlideArrowDirective} from './slide-arrow/slide-arrow.directive';
import {SlidePaginationComponent} from './slide-pagination/slide-pagination.component';
import {SlideComponent} from './slide/slide.component';
import {SliderComponent} from './slider/slider.component';
import {SlidesComponent} from './slides/slides.component';

export const OPTIONS = new InjectionToken<SliderOptions>('options');
export function optionsFactory(options) {
  return {
    ...DEFAULT_OPTIONS,
    ...options
  };
}

const COMPONENTS = [
  SlideArrowDirective,
  SliderComponent,
  SlideComponent,
  SlidesComponent,
  SlidePaginationComponent
];

@NgModule({
  declarations: [
    ...COMPONENTS
  ],
  imports: [
    CommonModule
  ],
  exports: COMPONENTS
})
export class SliderModule {
  static defaultOptions(options: Partial<SliderOptions> = {}): ModuleWithProviders {
    return {
      ngModule: SliderModule,
      providers: [
        {
          provide: OPTIONS,
          useValue: options
        },
        {
          provide: 'options',
          useFactory: optionsFactory,
          deps: [OPTIONS]
        }
      ]
    };
  }
}
