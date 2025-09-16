import { Component, EventEmitter, Input, Output } from "@angular/core";
import { UI_TEXT } from "../../abstractions/constants/ui.constants";

@Component({
  selector: "app-top-bar",
  templateUrl: "./top-bar.component.html",
  styleUrls: ["./top-bar.component.css"],
})
export class TopBarComponent {
  @Input() isConnected = false;
  @Input() connectionStatusText = "Not connected";
  @Input() connectionStatusColor = "#f97316";
  @Output() connect = new EventEmitter<void>();
  @Output() disconnect = new EventEmitter<void>();
  @Output() newKey = new EventEmitter<void>();
  @Output() toggleTheme = new EventEmitter<void>();

  ui = UI_TEXT;

  onConnect() {
    this.connect.emit();
  }
  onDisconnect() {
    this.disconnect.emit();
  }
  onNewKey() {
    this.newKey.emit();
  }
  onToggleTheme() {
    this.toggleTheme.emit();
  }
}
