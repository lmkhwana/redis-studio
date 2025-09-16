import { Injectable, signal } from "@angular/core";

/**
 * Service for managing application theme (dark/light mode)
 * Persists theme preference in localStorage
 */
@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private readonly THEME_KEY = "redis-studio-theme";
  private readonly DARK_THEME = "dark";
  private readonly LIGHT_THEME = "light";

  // Signal for reactive theme management
  public currentTheme = signal<string>(this.DARK_THEME);

  constructor() {}

  /**
   * Initialize theme from localStorage or system preference
   */
  initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);

    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      this.setTheme(prefersDark ? this.DARK_THEME : this.LIGHT_THEME);
    }
  }

  /**
   * Toggle between dark and light themes
   */
  toggleTheme(): void {
    const newTheme =
      this.currentTheme() === this.DARK_THEME
        ? this.LIGHT_THEME
        : this.DARK_THEME;
    this.setTheme(newTheme);
  }

  /**
   * Set specific theme
   */
  setTheme(theme: string): void {
    this.currentTheme.set(theme);
    localStorage.setItem(this.THEME_KEY, theme);

    // Update CSS custom properties based on theme
    this.updateCSSVariables(theme);
  }

  /**
   * Check if current theme is dark
   */
  isDarkTheme(): boolean {
    return this.currentTheme() === this.DARK_THEME;
  }

  /**
   * Update CSS custom properties for theming
   */
  private updateCSSVariables(theme: string): void {
    const root = document.documentElement;

    if (theme === this.DARK_THEME) {
      root.style.setProperty("--bg", "#0f1724");
      root.style.setProperty("--panel", "#0b1220");
      root.style.setProperty("--muted", "#9aa4b2");
      root.style.setProperty("--accent", "#4fd1c5");
      root.style.setProperty("--glass", "rgba(255,255,255,0.03)");
      root.style.setProperty("--glass-2", "rgba(255,255,255,0.02)");
      root.style.setProperty("--text-primary", "#e6eef6");
      root.style.setProperty("--text-secondary", "#9aa4b2");
    } else {
      root.style.setProperty("--bg", "#f8fafc");
      root.style.setProperty("--panel", "#ffffff");
      root.style.setProperty("--muted", "#64748b");
      root.style.setProperty("--accent", "#0891b2");
      root.style.setProperty("--glass", "rgba(0,0,0,0.03)");
      root.style.setProperty("--glass-2", "rgba(0,0,0,0.02)");
      root.style.setProperty("--text-primary", "#1e293b");
      root.style.setProperty("--text-secondary", "#64748b");
    }
  }
}
