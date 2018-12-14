import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {JpSliderModule} from 'ng-slider';
import {AppComponent} from './app.component';
import 'hammerjs';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    JpSliderModule.defaultOptions({
      blocksPerView: 1
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
