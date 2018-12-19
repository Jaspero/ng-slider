import {ChangeDetectionStrategy, Component, Inject, Input, QueryList} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {SlideArrowDirection} from '../enums/slide-arrow-direction.enum';
import {SliderOptions} from '../interfaces/slider-options.interface';
import {SlideComponent} from '../slide/slide.component';

@Component({
  selector: 'jp-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderComponent {
  constructor(
    @Inject('options') public defaultOptions: SliderOptions
  ) {}

  move$ = new Subject<SlideArrowDirection>();
  jumpToPage$ = new Subject<number>();
  finalOptions$ = new BehaviorSubject<SliderOptions>(this.defaultOptions);
  change$ = new Subject<{
    slideWidthPercentage: number,
    left: number,
    blocksPerView: number,
    slides: QueryList<SlideComponent>,
    blockWidth: number
  }>();

  @Input()
  set options(options: Partial<SliderOptions>) {
    this.finalOptions$.next({
      ...this.defaultOptions,
      ...options
    });
  }
}
