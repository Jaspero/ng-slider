import {NgModule} from '@angular/core';
import {JpSliderModule} from '../../dist/@jaspero/ng-slider';

@NgModule({
  imports: [JpSliderModule],
  exports: [JpSliderModule]
})
export class SharedModule {}
