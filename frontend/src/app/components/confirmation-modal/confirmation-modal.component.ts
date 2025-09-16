import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "app-confirmation-modal",
  templateUrl: "./confirmation-modal.component.html",
  styleUrls: ["./confirmation-modal.component.css"],
})
export class ConfirmationModalComponent {
  @Input() visible = false;
  @Input() title = "Confirm Action";
  @Input() message = "Are you sure?";
  @Input() confirmText = "Confirm";
  @Input() cancelText = "Cancel";
  @Input() destructive = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }
  onCancel(): void {
    this.cancelled.emit();
  }
}
