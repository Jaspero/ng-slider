import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild
} from '@angular/core';
import {BehaviorSubject, fromEvent, interval, merge, Subscription} from 'rxjs';
import {switchMap, takeUntil} from 'rxjs/operators';
import {SlideChange} from '../interfaces/slide-change.interface';
import {SliderOptions} from '../interfaces/slider-options.interface';
import {SlideComponent} from '../slide/slide.component';
import {SliderComponent} from '../slider/slider.component';

@Component({
  selector: 'jp-slides',
  templateUrl: './slides.component.html',
  styleUrls: ['./slides.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlidesComponent implements OnInit, AfterViewInit, OnDestroy {
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

  options: SliderOptions;

  blockWidth: number;
  contentWidth: number;
  slideWidthPercentage: number;
  maxLeft: number;
  left = 0;

  lastPosition = 0;
  startPanX = 0;
  active = true;

  timerReset$: BehaviorSubject<boolean>;

  private _manager: any;
  private _slideTimeInterval: Subscription;

  get transform() {
    return `translate3d(${this.left}%, 0px, 0px)`;
  }

  ngOnInit() {
    this.cdr.detach();

    this.slider.finalOptions$
      .subscribe(options => {
        this.options = options;

        this._autoSlide();

        if (this.slides) {
          this._setProps();
        }
      });

    this.slider.move$.subscribe(direction => {
      this.move(direction === 'right', this.options.movesPerClick);
    });

    this.slider.jumpToPage$.subscribe(num => {
      this.left = -this.slideWidthPercentage * num;

      this._resetTimer();

      this.cdr.detectChanges();

      this.slider.change$.next({
        left: this.left,
        blocksPerView: this.options.blocksPerView,
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

  ngOnDestroy() {
    if (this._manager) {
      this._manager.destroy();
    }

    if (this._slideTimeInterval) {
      this._slideTimeInterval.unsubscribe();
    }
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

    this._hammer();
  }

  move(right = true, amount = 1) {
    this._resetTimer();

    if (right) {
      this.left -= this.slideWidthPercentage * amount;
    } else {
      this.left += this.slideWidthPercentage * amount;
    }

    if (this.left < this.maxLeft) {
      this.left = 0;
    } else if (this.left > 0) {
      this.left = this.maxLeft;
    }

    this._shouldEmitSlideInView(amount);

    this.cdr.detectChanges();

    this.slider.change$.next({
      left: this.left,
      blocksPerView: this.options.blocksPerView,
      blockWidth: this.blockWidth,
      slides: this.slides,
      slideWidthPercentage: this.slideWidthPercentage
    });

    this._emitSlideChange();
  }

  private _setProps() {
    this.blockWidth = 100 / this.options.blocksPerView;
    this.contentWidth = this.blockWidth * this.slides.length;

    this.cdr.detectChanges();

    this.slideWidthPercentage = (<HTMLElement>this.wrapperInnerEl.nativeElement.children[0]).offsetWidth /
      this.wrapperInnerEl.nativeElement.offsetWidth * 100;

    this.maxLeft = -this.slideWidthPercentage * (this.slides.length - this.options.blocksPerView);

    const initialSlide = this.slider.finalOptions$.getValue().initialSlide;
    const slides = this.slides.toArray();

    if (initialSlide) {
      this.left = -this.slideWidthPercentage * initialSlide;
      this.cdr.detectChanges();
    } else {
      this.left = 0;
    }

    for (let i = 0; i < this.options.blocksPerView; i++) {
      if (!slides[initialSlide + i].viewed) {
        slides[initialSlide + i].viewed = true;
        this.slideInView.emit(initialSlide + i);
      }
    }

    this.slider.change$.next({
      left: this.left,
      blocksPerView: this.options.blocksPerView,
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

      const slides = this.slides.toArray();

      if (!slides[currentIndex + i].viewed) {
        slides[currentIndex + i].viewed = true;
        this.slideInView.emit(currentIndex + i);
      }
    }
  }

  private _hammer() {
    const hammer: any = typeof window !== 'undefined' ? (window as any).Hammer : null;

    if (hammer) {
      const mc = new hammer(this.wrapperEl.nativeElement);
      const pan = new hammer.Pan({
        direction: hammer.DIRECTION_HORIZONTAL
      });
      mc.add(pan);

      mc.on('panstart', event => {
        this.lastPosition = event.center.x;
        this.startPanX = event.center.x;

        this.active = false;
        this.cdr.detectChanges();
      });

      mc.on('panmove', event => {
        const movedDifferencePx = event.center.x - this.lastPosition;
        const movedDifferencePercentage = movedDifferencePx / this.wrapperInnerEl.nativeElement.offsetWidth * 100;

        this.left = this.left + movedDifferencePercentage;

        this.cdr.detectChanges();

        this.slider.change$.next({
          left: this.left,
          blocksPerView: this.options.blocksPerView,
          blockWidth: this.blockWidth,
          slides: this.slides,
          slideWidthPercentage: this.slideWidthPercentage
        });

        this.lastPosition = event.center.x;
      });

      mc.on('panend', event => {
        this.active = true;

        this.cdr.detectChanges();

        const shouldLockRight = (this.startPanX - event.center.x) > 0 ? 1 : 0;
        const pageNumSplitByDot = (this.left / this.slideWidthPercentage).toFixed(2).split('.');

        this.left = (+pageNumSplitByDot[0] - shouldLockRight) * this.slideWidthPercentage;

        this._resetTimer();

        const max = -this.slideWidthPercentage * (this.slides.length - this.options.blocksPerView);

        if (this.left < max) {
          this.left = 0;
        } else if (this.left > 1) {
          this.left = max;
        }

        this.cdr.detectChanges();

        this._shouldEmitSlideInView(this.options.blocksPerView);

        this.slider.change$.next({
          left: this.left,
          blocksPerView: this.options.blocksPerView,
          blockWidth: this.blockWidth,
          slides: this.slides,
          slideWidthPercentage: this.slideWidthPercentage
        });

        this._emitSlideChange();
      });

      this._manager = mc;
    }
  }

  private _autoSlide() {
    if (this.options.slideTime) {

      if (this._slideTimeInterval) {
        this._slideTimeInterval.unsubscribe();
      }

      this.timerReset$ = new BehaviorSubject(true);

      this._slideTimeInterval = merge(
        this.timerReset$,
        fromEvent(this.wrapperEl.nativeElement, 'mouseleave')
      )
        .pipe(
          switchMap(() => interval(this.options.slideTime)
            .pipe(
              takeUntil(fromEvent(this.wrapperEl.nativeElement, 'mouseenter'))
            ))
        )
        .subscribe(() => {
          this.move(true);
        });
    } else if (this._slideTimeInterval) {
      this._slideTimeInterval.unsubscribe();
      this._slideTimeInterval = null;
    }
  }
}
