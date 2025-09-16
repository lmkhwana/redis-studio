import { Component, EventEmitter, Input, Output } from "@angular/core";
import {
  RedisKey,
  RedisKeyValue,
} from "../../abstractions/models/redis.models";
import { UI_TEXT } from "../../abstractions/constants/ui.constants";

@Component({
  selector: "app-key-details",
  templateUrl: "./key-details.component.html",
  styleUrls: ["./key-details.component.css"],
})
export class KeyDetailsComponent {
  ui = UI_TEXT;
  @Input() selectedKey: RedisKey | null = null;
  @Input() selectedKeyValue: RedisKeyValue | null = null;
  @Input() isLoadingValue = false;
  @Input() lastFetched: Date | null = null;
  @Input() canEdit = false;
  @Input() formatValue!: (value: any) => string;

  @Output() export = new EventEmitter<void>();
  @Output() copy = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  trackByTag(i: number) {
    return i;
  }
}
