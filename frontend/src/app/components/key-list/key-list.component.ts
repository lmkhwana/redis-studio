import { Component, EventEmitter, Input, Output } from "@angular/core";
import { RedisKey } from "../../abstractions/models/redis.models";
import { UI_TEXT } from "../../abstractions/constants/ui.constants";

@Component({
  selector: "app-key-list",
  templateUrl: "./key-list.component.html",
  styleUrls: ["./key-list.component.css"],
})
export class KeyListComponent {
  ui = UI_TEXT;
  @Input() isConnected = false;
  @Input() isLoadingKeys = true;
  @Input() displayedKeys: RedisKey[] = [];
  @Input() selectedKey: RedisKey | null = null;
  @Input() total = 0;
  @Input() totalPages = 0;
  @Input() page = 0;
  @Input() searchPattern = "";
  @Input() typeFilter = "";
  @Input() pageSize = 10;
  @Input() getTypeColor!: (type: string) => string;
  @Input() getKeyDescription!: (key: RedisKey) => string;

  @Output() searchPatternChange = new EventEmitter<string>();
  @Output() typeFilterChange = new EventEmitter<string>();
  @Output() refresh = new EventEmitter<void>();
  @Output() select = new EventEmitter<RedisKey>();
  @Output() openNewKey = new EventEmitter<void>();

  onSearchChange(value: any) {
    this.searchPatternChange.emit(value as string);
  }
  onTypeFilterChange(value: any) {
    this.typeFilterChange.emit(value as string);
  }
  trackByKey(_i: number, item: RedisKey) {
    return item.key;
  }
}
