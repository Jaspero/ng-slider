import {
  Directive,
  EventEmitter,
  HostListener,
  Input,
  Output
} from '@angular/core';
import {SlideArrowDirection} from '../enums/slide-arrow-direction.enum';
import {SliderComponent} from '../slider/slider.component';

@Directive({
  selector: '[jpSlideArrow]'
})
export class SlideArrowDirective {
  constructor(private slider: SliderComponent) {}

  @Input('jpSlideArrow')
  direction: SlideArrowDirection = SlideArrowDirection.Right;

  @Output()
  arrowClicked = new EventEmitter<MouseEvent>();

  @HostListener('click', ['$event'])
  onClick(event) {
    this.arrowClicked.emit(event);
    this.slider.move$.next(this.direction);
  }
}
