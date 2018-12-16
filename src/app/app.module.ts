import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';
import 'hammerjs';
import {AppComponent} from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot([
      {
        path: 'simple-example',
        loadChildren: './simple-example/simple-example.module#SimpleExampleModule'
      }
    ])
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
