import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  QueryList,
  ViewChild
} from '@angular/core';
import {BehaviorSubject, fromEvent, interval, merge, Subscription} from 'rxjs';
import {switchMap, takeUntil} from 'rxjs/operators';
import {SlideChange} from '../interfaces/slide-change.interface';
import {SlideComponent} from '../slide/slide.component';
import {SliderComponent} from '../slider/slider.component';

@Component({
  selector: 'jp-slides',
  templateUrl: './slides.component.html',
  styleUrls: ['./slides.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlidesComponent implements OnInit, AfterViewInit {
  constructor(
    private slider: SliderComponent,
    private cdr: ChangeDetectorRef
  ) {}

  @ContentChildren(SlideComponent)
  slides: QueryList<SlideComponent>;

  @ViewChild('wrapper')
  wrapperEl: ElementRef<HTMLDivElement>;

  @ViewChild('wrapperInner')
  wrapperInnerEl: ElementRef<HTMLDivElement>;

  @Output()
  change = new EventEmitter<SlideChange>();

  blocksPerView = 1;

  left = 0;
  blockWidth: number;
  contentWidth: number;
  slideWidthPercentage: number;

  timerReset$: BehaviorSubject<boolean>;
  lastPosition = 0;
  startPanX = 0;

  active = false;

  private _slideTimeInterval: Subscription;

  get transform() {
    return `translate3d(${this.left}%, 0px, 0px)`;
  }

  ngOnInit() {
    this.cdr.detach();

    this.slider.finalOptions$
      .subscribe(options => {
        this.blocksPerView = options.blocksPerView;

        if (options.slideTime) {

          if (this._slideTimeInterval) {
            this._slideTimeInterval.unsubscribe();
          }

          this.timerReset$ = new BehaviorSubject(true);

          this._slideTimeInterval = merge(
            this.timerReset$,
            fromEvent(this.wrapperEl.nativeElement, 'mouseleave')
          )
            .pipe(
              switchMap(() => interval(options.slideTime)
                .pipe(
                  takeUntil(fromEvent(this.wrapperEl.nativeElement, 'mouseenter'))
                ))
            )
            .subscribe(() => {
              this.move(true);
            });
        }

        if (this.slides) {
          this._setProps();
        }
      });

    this.slider.move$.subscribe(direction => {
      this.move(direction === 'right');
    });

    this.slider.jumpToPage$.subscribe(num => {
      this.left = -this.slideWidthPercentage * num;

      this._resetTimer();

      this.cdr.detectChanges();

      this.slider.change$.next({
        left: this.left,
        blockPerView: this.blocksPerView,
        blockWidth: this.blockWidth,
        slides: this.slides,
        slideWidthPercentage: this.slideWidthPercentage
      });
    });
  }

  ngAfterViewInit() {

    if (this.slides && this.slides.first) {
      this._setProps();
    }

    this.slides.changes
      .subscribe(() => {
        if (this.slides.first) {
          this._setProps();
        }
      });
  }

  move(right = true) {
    this.active = true;

    setTimeout(() => {
      this.active = false;
    }, 1000);

    this._resetTimer();

    const max = -this.slideWidthPercentage * (this.slides.length - this.blocksPerView);

    if (right) {
      this.left -= this.slideWidthPercentage;
    } else {
      this.left += this.slideWidthPercentage;
    }

    if (this.left < max) {
      this.left = 0;
    } else if (this.left > 1) {
      this.left = max;
    }

    this.cdr.detectChanges();

    this.slider.change$.next({
      left: this.left,
      blockPerView: this.blocksPerView,
      blockWidth: this.blockWidth,
      slides: this.slides,
      slideWidthPercentage: this.slideWidthPercentage
    });

    this._emitSlideChange();
  }

  onPanStart(event) {
    this.lastPosition = event.center.x;
    this.startPanX = event.center.x;
  }

  onPanMove(event) {
    const movedDifferencePx = event.center.x - this.lastPosition;
    const movedDifferencePercentage = movedDifferencePx / this.wrapperInnerEl.nativeElement.offsetWidth * 100;

    this.left = this.left + movedDifferencePercentage;

    this.cdr.detectChanges();

    this.slider.change$.next({
      left: this.left,
      blockPerView: this.blocksPerView,
      blockWidth: this.blockWidth,
      slides: this.slides,
      slideWidthPercentage: this.slideWidthPercentage
    });

    this.lastPosition = event.center.x;
  }

  onPanEnd(event) {
    this.active = true;

    setTimeout(() => {
      this.active = false;
    }, 1000);

    const shouldLockRight = (this.startPanX - event.center.x) > 0 ? 1 : 0;
    const pageNumSplitByDot = (this.left / this.slideWidthPercentage).toFixed(2).split('.');

    this.left = (+pageNumSplitByDot[0] - shouldLockRight) * this.slideWidthPercentage;

    this._resetTimer();

    const max = -this.slideWidthPercentage * (this.slides.length - this.blocksPerView);

    if (this.left < max) {
      this.left = 0;
    } else if (this.left > 1) {
      this.left = max;
    }

    this.cdr.detectChanges();

    this.slider.change$.next({
      left: this.left,
      blockPerView: this.blocksPerView,
      blockWidth: this.blockWidth,
      slides: this.slides,
      slideWidthPercentage: this.slideWidthPercentage
    });

    this._emitSlideChange();
  }

  private _setProps() {
    this.left = 0;
    this.blockWidth = 100 / this.blocksPerView;
    this.contentWidth = this.blockWidth * this.slides.length;

    this.cdr.detectChanges();

    this.slideWidthPercentage = (<HTMLElement>this.wrapperInnerEl.nativeElement.children[0]).offsetWidth /
      this.wrapperInnerEl.nativeElement.offsetWidth * 100;

    this.slider.change$.next({
      left: this.left,
      blockPerView: this.blocksPerView,
      blockWidth: this.blockWidth,
      slides: this.slides,
      slideWidthPercentage: this.slideWidthPercentage
    });
  }

  private _resetTimer() {
    if (this.timerReset$) {
      this.timerReset$.next(true);
    }
  }

  private _emitSlideChange() {
    const leftAbs = Math.abs(this.left);
    const currentIndex = leftAbs ? (this.blockWidth / leftAbs) - 1 : 0;

    this.change.next({
      index: currentIndex,
      slide: this.slides.toArray()[currentIndex]
    });
  }
}
