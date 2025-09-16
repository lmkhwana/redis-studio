import { Component, Input } from "@angular/core";
import { UI_TEXT } from "../../abstractions/constants/ui.constants";

@Component({
  selector: "app-memory-usage",
  templateUrl: "./memory-usage.component.html",
  styleUrls: ["./memory-usage.component.css"],
})
export class MemoryUsageComponent {
  @Input() percent = 0;
  ui = UI_TEXT;
}
