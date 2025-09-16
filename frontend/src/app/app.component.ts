import { Component, OnInit } from "@angular/core";
import { ThemeService } from "./services/theme.service";

/**
 * Root application component
 * Manages theme initialization and global app state
 */
@Component({
  selector: "app-root",
  template: `
    <div class="app" [attr.data-theme]="themeService.currentTheme()">
      <app-main-app></app-main-app>
    </div>
  `,
  styles: [
    `
      .app {
        height: 100vh;
        transition: background-color 0.3s ease;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  constructor(public themeService: ThemeService) {}

  ngOnInit(): void {
    // Initialize theme from localStorage
    this.themeService.initializeTheme();
  }
}
