import {ChangeDetectionStrategy, Component, TemplateRef, ViewChild} from '@angular/core';

@Component({
  selector: 'jp-slide',
  templateUrl: './slide.component.html',
  styleUrls: ['./slide.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlideComponent {

  @ViewChild(TemplateRef)
  content: TemplateRef<any>;

  viewed = false;
}
