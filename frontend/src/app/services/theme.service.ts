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
      root.style.setProperty(
        "--modal-bg",
        "linear-gradient(180deg, #071026 0%, #071827 60%)"
      );
      root.style.setProperty(
        "--panel-gradient",
        "linear-gradient(180deg, var(--glass-2), rgba(255,255,255,0.01))"
      );
      root.style.setProperty(
        "--topbar-gradient",
        "linear-gradient(90deg, var(--glass-2), rgba(255,255,255,0.01))"
      );
      root.style.setProperty(
        "--body-gradient",
        "linear-gradient(180deg,#071026 0%,#071827 60%)"
      );
      // Extended dark
      root.style.setProperty("--panel-alt", "#071827");
      root.style.setProperty(
        "--gradient-accent",
        "linear-gradient(135deg, #0ea5a4, #2dd4bf)"
      );
      root.style.setProperty("--btn-accent-bg", "#0ea5a4");
      root.style.setProperty("--btn-accent-bg-hover", "#2dd4bf");
      root.style.setProperty("--btn-accent-text", "#042027");
      root.style.setProperty("--btn-warn-bg", "#f97316");
      root.style.setProperty("--btn-warn-text", "#042027");
      root.style.setProperty("--danger", "#ef4444");
      root.style.setProperty("--btn-danger-border", "#ef4444");
      root.style.setProperty("--btn-danger-bg", "rgba(239,68,68,0.08)");
      root.style.setProperty("--btn-danger-text", "#ef4444");
      root.style.setProperty("--input-bg", "var(--glass-2)");
      root.style.setProperty("--input-border", "var(--glass)");
      root.style.setProperty("--input-border-focus", "var(--accent)");
      root.style.setProperty("--border-color", "var(--glass)");
      root.style.setProperty("--border-color-strong", "#1e2a3a");
      root.style.setProperty("--shadow-elev", "0 8px 24px rgba(2, 6, 23, 0.6)");
      root.style.setProperty("--shadow-modal", "0 10px 32px rgba(0,0,0,0.55)");
      root.style.setProperty("--shadow-topbar", "0 4px 14px rgba(2,6,23,0.55)");
      root.style.setProperty("--shadow-card", "0 10px 26px rgba(2,6,23,0.55)");
      root.style.setProperty(
        "--focus-ring",
        "0 0 0 2px #0b1220, 0 0 0 4px var(--accent)"
      );
      root.style.setProperty("--accent-alt", "#2dd4bf");
      root.style.setProperty("--scrollbar-track", "#0b1220");
      root.style.setProperty("--scrollbar-thumb", "#1e2a3a");
    } else {
      root.style.setProperty("--bg", "#f8fafc");
      root.style.setProperty("--panel", "#ffffff");
      root.style.setProperty("--muted", "#64748b");
      root.style.setProperty("--accent", "#0891b2");
      root.style.setProperty("--glass", "rgba(0,0,0,0.03)");
      root.style.setProperty("--glass-2", "rgba(0,0,0,0.02)");
      root.style.setProperty("--text-primary", "#1e293b");
      root.style.setProperty("--text-secondary", "#64748b");
      root.style.setProperty(
        "--modal-bg",
        "linear-gradient(180deg,#ffffff,#f1f5f9)"
      );
      root.style.setProperty(
        "--panel-gradient",
        "linear-gradient(180deg,#ffffff,#f1f5f9)"
      );
      root.style.setProperty(
        "--topbar-gradient",
        "linear-gradient(90deg,#ffffff,#f1f5f9)"
      );
      root.style.setProperty(
        "--body-gradient",
        "linear-gradient(180deg,#ffffff,#e2e8f0)"
      );
      // Extended light
      root.style.setProperty("--panel-alt", "#e2e8f0");
      root.style.setProperty(
        "--gradient-accent",
        "linear-gradient(135deg, #0ea5a4, #2dd4bf)"
      );
      root.style.setProperty("--btn-accent-bg", "#0ea5a4");
      root.style.setProperty("--btn-accent-bg-hover", "#0891b2");
      root.style.setProperty("--btn-accent-text", "#042027");
      root.style.setProperty("--btn-warn-bg", "#f97316");
      root.style.setProperty("--btn-warn-text", "#ffffff");
      root.style.setProperty("--danger", "#dc2626");
      root.style.setProperty("--btn-danger-border", "#dc2626");
      root.style.setProperty("--btn-danger-bg", "#fee2e2");
      root.style.setProperty("--btn-danger-text", "#dc2626");
      root.style.setProperty("--input-bg", "#ffffff");
      root.style.setProperty("--input-border", "#cbd5e1");
      root.style.setProperty("--input-border-focus", "#0891b2");
      root.style.setProperty("--border-color", "#cbd5e1");
      root.style.setProperty("--border-color-strong", "#94a3b8");
      root.style.setProperty("--shadow-elev", "0 1px 3px rgba(2, 6, 23, 0.6)");
      root.style.setProperty("--shadow-modal", "0 10px 32px rgba(0,0,0,0.12)");
      root.style.setProperty(
        "--shadow-topbar",
        "0 2px 4px rgba(0,0,0,0.06), 0 4px 10px rgba(0,0,0,0.04)"
      );
      root.style.setProperty(
        "--shadow-card",
        "0 3px 10px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.6)"
      );
      root.style.setProperty(
        "--focus-ring",
        "0 0 0 2px #ffffff, 0 0 0 4px #0891b2"
      );
      root.style.setProperty("--accent-alt", "#0891b2");
      root.style.setProperty("--scrollbar-track", "#f1f5f9");
      root.style.setProperty("--scrollbar-thumb", "#cbd5e1");
    }
  }
}
