import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {SliderComponent} from '../slider/slider.component';

@Component({
  selector: 'jp-slide-pagination',
  templateUrl: './slide-pagination.component.html',
  styleUrls: ['./slide-pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlidePaginationComponent implements OnInit {
  constructor(
    private _cdr: ChangeDetectorRef,
    private _slider: SliderComponent
  ) {}

  active: number;
  pagDots = [];
  blocksPerView: number;

  ngOnInit() {

    this._cdr.detach();

    this._slider.change$.subscribe(data => {
      /**
       * Only rebuild view count if necessary
       */
      if (data.blocksPerView !== this.blocksPerView) {
        this.pagDots = [];

        const views = data.slides.length - data.blocksPerView + 1;

        for (let i = 0; i < views; i++) {
          this.pagDots.push(i);
        }
      }

      this.blocksPerView = data.blocksPerView;

      this.active = Math.abs(+(data.left / data.slideWidthPercentage).toFixed(0));
      this._cdr.detectChanges();
    });
  }

  pagMove(i) {
    this.active = i;
    this._slider.jumpToSlide$.next(i);
    this._cdr.detectChanges();
  }
}
