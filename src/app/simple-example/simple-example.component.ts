import {ChangeDetectionStrategy, ChangeDetectorRef, Component, QueryList, ViewChildren} from '@angular/core';
import {SliderOptions} from '../../../projects/ng-slider/src/lib/interfaces/slider-options.interface';
import {SlideComponent} from '../../../projects/ng-slider/src/lib/slide/slide.component';
import {SET_ONE} from '../consts/set-one.const';

@Component({
  selector: 'jp-simple-example',
  templateUrl: './simple-example.component.html',
  styleUrls: ['./simple-example.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleExampleComponent {
  constructor(
    private _cdr: ChangeDetectorRef
  ) {}

  dataSet = SET_ONE;

  @ViewChildren(SlideComponent) slides !: QueryList<SlideComponent>;

  sliderOptions: Partial<SliderOptions> = {
    blocksPerView: 3,
    slideTime: 5000,
    movesPerClick: 1
  };

  changeSize(size: number) {
    this._cdr.detectChanges();
    const toSet = this.sliderOptions.blocksPerView + size;

    this.sliderOptions = {
      blocksPerView: toSet,
      slideTime: this.sliderOptions.slideTime
    };
  }

  slideInView(index) {}

  gotClicked() {
    console.log('blaa');
  }
}
