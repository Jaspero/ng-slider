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

  @Output()
  slideInView = new EventEmitter<number>();

  blocksPerView = 1;
  movesPerClick = 1;

  left = 0;
  blockWidth: number;
  contentWidth: number;
  slideWidthPercentage: number;

  lastPosition = 0;
  startPanX = 0;
  active = false;
  timerReset$: BehaviorSubject<boolean>;

  private _slideTimeInterval: Subscription;

  get transform() {
    return `translate3d(${this.left}%, 0px, 0px)`;
  }

  ngOnInit() {
    this.cdr.detach();

    this.slider.finalOptions$
      .subscribe(options => {
        this.blocksPerView = options.blocksPerView;
        this.movesPerClick = options.movesPerClick;

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
      this.move(direction === 'right', this.movesPerClick);
    });

    this.slider.jumpToPage$.subscribe(num => {
      this.left = -this.slideWidthPercentage * num;

      this._resetTimer();

      this.cdr.detectChanges();

      this.slider.change$.next({
        left: this.left,
        blocksPerView: this.blocksPerView,
        blockWidth: this.blockWidth,
        slides: this.slides,
        slideWidthPercentage: this.slideWidthPercentage
      });

      this.change.next({
        index: num,
        slide: this.slides.toArray()[num]
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

  move(right = true, amount = 1) {
    this.active = true;

    setTimeout(() => {
      this.active = false;
    }, 1000);

    this._resetTimer();

    const max = -this.slideWidthPercentage * (this.slides.length - this.blocksPerView);

    if (right) {
      this.left -= this.slideWidthPercentage * amount;
    } else {
      this.left += this.slideWidthPercentage * amount;
    }

    if (this.left < max) {
      this.left = 0;
    } else if (this.left > 1) {
      this.left = max;
    }

    this._shouldEmitSlideInView(amount);

    this.cdr.detectChanges();

    this.slider.change$.next({
      left: this.left,
      blocksPerView: this.blocksPerView,
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
      blocksPerView: this.blocksPerView,
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

    this._shouldEmitSlideInView(this.blocksPerView);

    this.slider.change$.next({
      left: this.left,
      blocksPerView: this.blocksPerView,
      blockWidth: this.blockWidth,
      slides: this.slides,
      slideWidthPercentage: this.slideWidthPercentage
    });

    this._emitSlideChange();
  }

  private _setProps() {
    this.blockWidth = 100 / this.blocksPerView;
    this.contentWidth = this.blockWidth * this.slides.length;

    this.cdr.detectChanges();

    this.slideWidthPercentage = (<HTMLElement>this.wrapperInnerEl.nativeElement.children[0]).offsetWidth /
      this.wrapperInnerEl.nativeElement.offsetWidth * 100;

    const initialSlide = this.slider.finalOptions$.getValue().initialSlide;
    if (initialSlide) {
      this.left = -this.slideWidthPercentage * initialSlide;
      this.cdr.detectChanges();
    } else {
      this.left = 0;
    }

    const slides: SlideComponent[] = this.slides.toArray();
    for (let i = 0; i < (this.blocksPerView); i++) {
      if (!slides[initialSlide + i].viewed) {
        slides[initialSlide + i].viewed = true;
        this.slideInView.emit(initialSlide + i);
      }
    }

    this.slider.change$.next({
      left: this.left,
      blocksPerView: this.blocksPerView,
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
    const index = leftAbs ? (this.blockWidth / leftAbs) - 1 : 0;

    this.change.next({
      slide: this.slides.toArray()[index],
      index
    });
  }

  private _shouldEmitSlideInView(conditionValue) {
    const currentIndex = Math.abs(this.left / this.slideWidthPercentage);
    for (let i = 0; i < conditionValue; i++) {
      const slides: SlideComponent[] = this.slides.toArray();
      if (!slides[currentIndex + i].viewed) {
        slides[currentIndex + i].viewed = true;
        this.slideInView.emit(currentIndex + i);
      }
    }
  }
}
