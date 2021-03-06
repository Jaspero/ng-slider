import {DOCUMENT} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild
} from '@angular/core';
import {BehaviorSubject, fromEvent, interval, merge, Subscription} from 'rxjs';
import {filter, switchMap, takeUntil} from 'rxjs/operators';
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
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: any
  ) {}

  @ContentChildren(SlideComponent)
  slides: QueryList<SlideComponent>;

  @ViewChild('wrapper', {static: true})
  wrapperEl: ElementRef<HTMLDivElement>;

  @ViewChild('wrapperInner', {static: true})
  wrapperInnerEl: ElementRef<HTMLDivElement>;

  @Output()
  change = new EventEmitter<SlideChange>();

  @Output()
  slideInView = new EventEmitter<{index: number; slide: Element}>();

  options: SliderOptions;

  blockWidth: number;
  contentWidth: number;
  slideWidthPercentage: number;
  maxLeft: number;
  left = 0;
  lastPosition = 0;
  startPanX = 0;
  inPan = false;
  mouseOver = false;
  blockAutoSlide = false;
  blockSlideAnimation = false;

  timerReset$: BehaviorSubject<boolean>;

  private _manager: any;
  private _slideTimeInterval: Subscription;
  private _mouseEnterSubscription: Subscription;
  private _mouseLeaveSubscription: Subscription;

  get transform() {
    return `translate3d(${this.left}%, 0px, 0px)`;
  }

  @HostListener('mouseover')
  onMouseOver() {
    this.mouseOver = true;
  }

  @HostListener('mouseout')
  onMouseOut() {
    this.mouseOver = false;
  }

  @HostListener('document:keydown', ['$event'])
  keyDown(event: KeyboardEvent) {
    if (this.mouseOver) {
      switch (event.code) {
        case 'ArrowLeft':
          this.move(false, this.options.movesPerClick);
          break;
        case 'ArrowRight':
          this.move(true, this.options.movesPerClick);
          break;
      }
    }
  }

  ngOnInit() {
    this.cdr.detach();

    this.slider.finalOptions$.subscribe(options => {
      this.options = options;

      this._autoSlide();

      if (this.slides) {
        this._setProps();
      }
    });

    this.slider.move$.subscribe(direction => {
      this.move(direction === 'right', this.options.movesPerClick);
    });

    this.slider.jumpToSlide$.subscribe(num => {
      this.inPan = true;
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
      this.inPan = false;

      this.change.next({
        index: num,
        slide: this.slides.toArray()[num]
      });

      this._shouldEmitSlideInView(this.options.blocksPerView, false);
    });
  }

  ngOnDestroy() {
    if (this._manager) {
      this._manager.destroy();
    }

    [
      this._slideTimeInterval,
      this._mouseEnterSubscription,
      this._mouseLeaveSubscription
    ]
      .filter(subscription => subscription)
      .forEach(subscription => subscription.unsubscribe());
  }

  ngAfterViewInit() {
    if (this.slides && this.slides.first) {
      this._setProps();
    }

    this.slides.changes.subscribe(() => {
      if (this.slides.first) {
        this._setProps();
      }
    });

    this._hammer();
  }

  move(right = true, amount = 1) {
    this._resetTimer();
    let nextPosition;

    let move: boolean;
    if (right) {
      nextPosition = this.left - this.slideWidthPercentage * amount;
      move = true;
    } else {
      nextPosition = this.left + this.slideWidthPercentage * amount;
      move = false;
    }

    const gap = this.slideWidthPercentage * (amount - 1);
    const loop = this.options.loop;

    this.inPan = !this.options.firstToLastTransition;

    switch (true) {
      case nextPosition < this.maxLeft && nextPosition >= this.maxLeft - gap:
      case nextPosition < this.maxLeft &&
        !(nextPosition >= this.maxLeft - gap) &&
        !loop:
        this.left = this.maxLeft;
        break;
      case nextPosition < this.maxLeft &&
        !(nextPosition >= this.maxLeft - gap) &&
        loop:
      case nextPosition > 0 && nextPosition <= gap:
        this.left = 0;
        break;
      case nextPosition > 0 && !(nextPosition <= gap) && loop:
        amount = this.options.blocksPerView;
        this.left = this.maxLeft;
        break;
      case nextPosition > 0 && !(nextPosition <= gap) && !loop:
        amount = this.options.blocksPerView;
        this.left = 0;
        break;
      default:
        this.left = nextPosition;
        this.inPan = false;
    }

    this._shouldEmitSlideInView(amount, move);

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
    this.contentWidth = Math.max(this.blockWidth * this.slides.length, 100);

    this.cdr.detectChanges();

    this.slideWidthPercentage =
      ((<HTMLElement>(
        this.wrapperInnerEl.nativeElement.children[0]
      )).getBoundingClientRect().width /
        this.wrapperInnerEl.nativeElement.getBoundingClientRect().width) *
      100;

    this.maxLeft =
      -this.slideWidthPercentage *
      (this.slides.length - this.options.blocksPerView);

    const initialSlide = this.options.initialSlide;
    const slides = this.slides.toArray();

    if (initialSlide) {
      this.blockSlideAnimation = true;
      this.left = -this.slideWidthPercentage * initialSlide;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.blockSlideAnimation = false;
        // todo: follow up dynamic value when it's implemented #4
      }, 500);
    } else {
      this.left = 0;
    }

    for (let i = 0; i < this.options.blocksPerView; i++) {
      const checkIndex = initialSlide + i;

      if (slides[checkIndex] && !slides[checkIndex].viewed) {
        slides[checkIndex].viewed = true;
        this.slideInView.emit({
          index: checkIndex,
          slide: this.wrapperInnerEl.nativeElement.children[checkIndex]
        });
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
    const index =
      Math.round(Math.abs(this.left / this.slideWidthPercentage)) +
      (this.options.blocksPerView - 1);

    this.change.next({
      slide: this.slides.toArray()[index],
      index
    });
  }

  private _shouldEmitSlideInView(conditionValue, addBlocksPerView = true) {
    const currentIndex =
      Math.round(Math.abs(this.left / this.slideWidthPercentage)) +
      (addBlocksPerView ? this.options.blocksPerView - 1 : 0);
    const slides = this.slides.toArray();
    for (let i = 0; i < conditionValue; i++) {
      const checkIndex = currentIndex + i;
      if (slides[checkIndex] && !slides[checkIndex].viewed) {
        slides[checkIndex].viewed = true;
        this.slideInView.emit({
          index: checkIndex,
          slide: this.wrapperInnerEl.nativeElement.children[checkIndex]
        });
      }
    }
  }

  private _hammer() {
    const hammer: any =
      typeof window !== 'undefined' ? (window as any).Hammer : null;

    if (hammer) {
      const mc = new hammer(this.wrapperEl.nativeElement);
      const pan = new hammer.Pan({
        direction: hammer.DIRECTION_HORIZONTAL
      });
      mc.add(pan);

      mc.on('panstart', event => {
        this.lastPosition = event.center.x;
        this.startPanX = event.center.x;

        this.inPan = true;
        this.cdr.detectChanges();
      });

      mc.on('panmove', event => {
        const movedDifferencePx = event.center.x - this.lastPosition;
        const movedDifferencePercentage =
          (movedDifferencePx /
            this.wrapperInnerEl.nativeElement.getBoundingClientRect().width) *
          100;

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
        this.inPan = false;

        this.cdr.detectChanges();

        const shouldLockRight = this.startPanX - event.center.x > 0 ? 1 : 0;
        const pageNumSplitByDot = (this.left / this.slideWidthPercentage)
          .toFixed(2)
          .split('.');

        this.left =
          (+pageNumSplitByDot[0] - shouldLockRight) * this.slideWidthPercentage;

        this._resetTimer();

        if (this.left < this.maxLeft) {
          this.left = this.options.loop ? 0 : this.maxLeft;
        } else if (this.left > 0) {
          this.left = this.options.loop ? this.maxLeft : 0;
        }

        this.cdr.detectChanges();

        this._shouldEmitSlideInView(this.options.blocksPerView, false);

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

      /**
       * Detect if mouse is inside/outside of page
       */
      this._mouseEnterSubscription = fromEvent(
        this.document,
        'mouseenter'
      ).subscribe(() => (this.blockAutoSlide = false));
      this._mouseLeaveSubscription = fromEvent(
        this.document,
        'mouseleave'
      ).subscribe(() => (this.blockAutoSlide = true));

      this._slideTimeInterval = merge(
        this.timerReset$,
        fromEvent(this.wrapperEl.nativeElement, 'mouseleave')
      )
        .pipe(
          switchMap(() =>
            interval(this.options.slideTime).pipe(
              takeUntil(fromEvent(this.wrapperEl.nativeElement, 'mouseenter'))
            )
          ),
          /**
           * Auto slide is blocked if mouse is outside of page
           */
          filter(() => !this.blockAutoSlide)
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
