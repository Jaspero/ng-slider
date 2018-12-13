import {Directive, HostListener, Input} from '@angular/core';
import {SlideArrowDirection} from '../enums/slide-arrow-direction.enum';
import {SliderComponent} from '../slider/slider.component';

@Directive({
  selector: '[jp-slide-arrow]'
})
export class SlideArrowDirective {
  constructor(
    private slider: SliderComponent
  ) {}

  @Input('jp-slide-arrow')
  direction: SlideArrowDirection = SlideArrowDirection.Right;

  @HostListener('click')
  onClick() {
    this.slider.move$.next(this.direction);
  }
}
