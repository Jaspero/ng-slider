import {NgModule} from '@angular/core';
import {JpSliderModule} from '@jaspero/ng-slider';

@NgModule({
  imports: [
    JpSliderModule
  ],
  exports: [
    JpSliderModule
  ],
})
export class SharedModule {
}
