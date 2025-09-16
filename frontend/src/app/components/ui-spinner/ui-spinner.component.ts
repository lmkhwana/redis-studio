import { Component, Input } from "@angular/core";

@Component({
  selector: "app-ui-spinner",
  template: `<div
    class="spinner"
    [style.width.px]="size"
    [style.height.px]="size"
    [class.inline]="inline"
    aria-hidden="true"
  ></div>`,
  styleUrls: ["./ui-spinner.component.css"],
})
export class UiSpinnerComponent {
  @Input() size = 32;
  @Input() inline = false;
}
