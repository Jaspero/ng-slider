import {Directive, HostListener, Input} from '@angular/core';
import {SlideArrowDirection} from '../enums/slide-arrow-direction.enum';
import {SliderComponent} from '../slider/slider.component';

@Directive({
  selector: '[jpSlideArrow]'
})
export class SlideArrowDirective {
  constructor(
    private slider: SliderComponent
  ) {}

  @Input('jpSlideArrow')
  direction: SlideArrowDirection = SlideArrowDirection.Right;

  @HostListener('click')
  onClick() {
    this.slider.move$.next(this.direction);
  }
}
