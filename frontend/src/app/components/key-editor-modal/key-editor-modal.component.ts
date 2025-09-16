import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import {
  RedisKey,
  RedisKeyValue,
} from "../../abstractions/models/redis.models";
import { UI_TEXT } from "../../abstractions/constants/ui.constants";

export interface KeyEditorPayload {
  key: string;
  type: string;
  value: string;
  ttlSeconds?: number | null;
}

@Component({
  selector: "app-key-editor-modal",
  templateUrl: "./key-editor-modal.component.html",
  styleUrls: ["./key-editor-modal.component.css"],
})
export class KeyEditorModalComponent implements OnChanges {
  ui = UI_TEXT;
  @Input() visible = false;
  @Input() editingKey: RedisKey | null = null;
  @Input() existingValue: RedisKeyValue | null = null;
  @Input() isSaving = false;

  @Output() closed = new EventEmitter<void>();
  @Output() save = new EventEmitter<KeyEditorPayload>();

  form: KeyEditorPayload = {
    key: "",
    type: "string",
    value: "",
    ttlSeconds: null,
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes["editingKey"] ||
      changes["existingValue"] ||
      changes["visible"]
    ) {
      if (this.visible) {
        if (this.editingKey) {
          this.form = {
            key: this.editingKey.key,
            type: this.editingKey.type,
            value: this.existingValue ? this.existingValue.value : "",
            ttlSeconds: this.editingKey.ttl || null,
          };
        } else {
          this.form = { key: "", type: "string", value: "", ttlSeconds: null };
        }
      }
    }
  }

  isEdit(): boolean {
    return !!this.editingKey;
  }

  submit(formValid: boolean | null) {
    if (!formValid) return;
    this.save.emit({
      key: this.form.key,
      type: this.form.type,
      value: this.form.value,
      ttlSeconds: this.form.ttlSeconds || undefined,
    });
  }
}
