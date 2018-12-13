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
  blockPerView: number;

  ngOnInit() {

    this._cdr.detach();

    this._slider.change$.subscribe(data => {
      /**
       * Only rebuild view count if necessary
       */
      if (data.blockPerView !== this.blockPerView) {
        this.pagDots = [];

        const views = data.slides.length - data.blockPerView + 1;

        for (let i = 0; i < views; i++) {
          this.pagDots.push(i);
        }
      }

      this.blockPerView = data.blockPerView;

      this.active = Math.abs(+(data.left / data.slideWidthPercentage).toFixed(0));
      this._cdr.detectChanges();
    });
  }

  pagMove(i) {
    this.active = i;
    this._slider.jumpToPage$.next(i);
    this._cdr.detectChanges();
  }
}
