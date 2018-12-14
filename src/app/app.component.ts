import {ChangeDetectorRef, Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SliderOptions} from '../../projects/ng-slider/src/lib/interfaces/slider-options.interface';
import {SlideComponent} from '../../projects/ng-slider/src/lib/slide/slide.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private _cdr: ChangeDetectorRef,
    private _http: HttpClient
  ) {}

  members = [];

  @ViewChildren(SlideComponent) slides !: QueryList<SlideComponent>;

  sliderOptions: Partial<SliderOptions> = {
    blocksPerView: 2,
    slideTime: 5000
  };

  ngOnInit() {
    this.getData();
  }

  getData() {
    this._http.get('https://api.jaspero.club/api/v1/p/genos-glyco/members')
      .subscribe((item: any) => {
        this.members = item.data.slice(0, 5);
        this._cdr.detectChanges();
      });
  }

  changeSize(size: number) {
    this._cdr.detectChanges();
    const toSet = this.sliderOptions.blocksPerView + size;

    this.sliderOptions = {
      blocksPerView: toSet,
      slideTime: this.sliderOptions.slideTime
    };
  }
}
