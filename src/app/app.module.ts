import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {SliderModule} from 'ng-slider/slider.module';
import {AppComponent} from './app.component';
import 'hammerjs';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    SliderModule.defaultOptions({
      blocksPerView: 1
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
