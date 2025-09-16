import { NgModule } from "@angular/core";
import { DatePipe } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";

// Material UI imports
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatChipsModule } from "@angular/material/chips";

// Application components
import { AppComponent } from "./app.component";
import { MainAppComponent } from "./components/main-app/main-app.component";
import { ConnectionModalComponent } from "./components/connection-modal/connection-modal.component";
import { TopBarComponent } from "./components/top-bar/top-bar.component";
import { MemoryUsageComponent } from "./components/memory-usage/memory-usage.component";
import { KeyListComponent } from "./components/key-list/key-list.component";
import { KeyDetailsComponent } from "./components/key-details/key-details.component";
import { PaginationControlsComponent } from "./components/pagination-controls/pagination-controls.component";
import { UiSpinnerComponent } from "./components/ui-spinner/ui-spinner.component";
import { KeyEditorModalComponent } from "./components/key-editor-modal/key-editor-modal.component";
import { ConfirmationModalComponent } from "./components/confirmation-modal/confirmation-modal.component";

// Services
import { RedisService } from "./services/redis.service";
import { ThemeService } from "./services/theme.service";

@NgModule({
  declarations: [
    AppComponent,
    MainAppComponent,
    ConnectionModalComponent,
    TopBarComponent,
    MemoryUsageComponent,
    KeyListComponent,
    KeyDetailsComponent,
    PaginationControlsComponent,
    UiSpinnerComponent,
    KeyEditorModalComponent,
    ConfirmationModalComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,

    // Material UI modules
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule,
  ],
  providers: [RedisService, ThemeService, DatePipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
