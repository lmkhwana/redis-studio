import { Component, EventEmitter, Input, Output } from "@angular/core";
import { UI_TEXT } from "../../abstractions/constants/ui.constants";

@Component({
  selector: "app-pagination-controls",
  templateUrl: "./pagination-controls.component.html",
  styleUrls: ["./pagination-controls.component.css"],
})
export class PaginationControlsComponent {
  ui = UI_TEXT;
  @Input() page = 0;
  @Input() totalPages = 0;
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [10];
  @Input() disabled = false;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  first() {
    if (this.page > 0) this.pageChange.emit(0);
  }
  prev() {
    if (this.page > 0) this.pageChange.emit(this.page - 1);
  }
  next() {
    if (this.page < this.totalPages - 1) this.pageChange.emit(this.page + 1);
  }
  last() {
    if (this.page < this.totalPages - 1)
      this.pageChange.emit(this.totalPages - 1);
  }
  onPageSizeChange(v: any) {
    this.pageSizeChange.emit(+v);
  }
}
