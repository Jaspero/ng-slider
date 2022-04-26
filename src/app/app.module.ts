import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';
import 'hammerjs';
import {AppComponent} from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot([
      {
        path: 'simple-example',
        loadChildren: () =>
          import('./simple-example/simple-example.module').then(
            m => m.SimpleExampleModule
          )
      }
    ])
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
