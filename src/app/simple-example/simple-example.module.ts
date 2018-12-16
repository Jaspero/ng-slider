import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {SharedModule} from '../shared.module';
import {SimpleExampleComponent} from './simple-example.component';

@NgModule({
  declarations: [SimpleExampleComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([{
      path: '',
      component: SimpleExampleComponent
    }])
  ]
})
export class SimpleExampleModule { }
