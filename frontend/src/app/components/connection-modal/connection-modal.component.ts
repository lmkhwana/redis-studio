import { Component, OnInit, EventEmitter, Output, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { RedisService } from "../../services/redis.service";
import { UI_TEXT } from "../../abstractions/constants/ui.constants";

/**
 * Connection modal component for Redis connection setup
 * Matches the design from the original HTML with enhanced functionality
 */
@Component({
  selector: "app-connection-modal",
  templateUrl: "./connection-modal.component.html",
  styleUrls: ["./connection-modal.component.css"],
})
export class ConnectionModalComponent implements OnInit {
  ui = UI_TEXT;
  @Output() connected = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();
  @Input() isAlreadyConnected = false;

  isVisible = false; // default hidden; main app will open if needed
  isConnecting = false;
  showAdvanced = false;
  feedbackMessage = "Ready to connect";
  feedbackColor = "var(--muted)";
  isSecure = false;
  recentConnections: string[] = [];

  connectionForm: FormGroup;

  constructor(private fb: FormBuilder, private redisService: RedisService) {
    this.connectionForm = this.fb.group({
      connectionString: ["redis://127.0.0.1:6379", [Validators.required]],
      saveConnection: [true],
      database: [0, [Validators.min(0), Validators.max(15)]],
      timeout: [5000, [Validators.min(1000)]],
    });
  }

  ngOnInit(): void {
    this.loadRecentConnections();
    this.connectionForm
      .get("connectionString")
      ?.valueChanges.subscribe((value) => {
        this.isSecure =
          value?.includes("rediss://") || value?.includes("tls://");
      });
  }

  async onConnect(): Promise<void> {
    if (this.connectionForm.invalid) return;

    this.isConnecting = true;
    this.feedbackMessage = "Connecting...";
    this.feedbackColor = "var(--accent)";

    const connectionString = this.connectionForm.get("connectionString")?.value;

    try {
      const connectionId = await this.redisService
        .connect(connectionString)
        .toPromise();
      const isConnected = !!connectionId;
      if (connectionId) {
        this.feedbackMessage = "Connected successfully";
        this.feedbackColor = "#10b981";

        // Save connection if requested
        if (this.connectionForm.get("saveConnection")?.value) {
          this.saveConnection(connectionString);
        }

        // Update service connection status
        // status already updated by service
        // Emit connection success and close modal
        setTimeout(() => {
          this.connected.emit(connectionId);
          this.hide();
        }, 1000);
      } else {
        throw new Error("Connection failed");
      }
    } catch (error) {
      this.feedbackMessage = "Connection failed. Please check your settings.";
      this.feedbackColor = "#ef4444";
      console.error("Connection error:", error);
    } finally {
      this.isConnecting = false;
    }
  }

  selectConnection(connectionString: string): void {
    this.connectionForm.patchValue({ connectionString });
    this.onConnect();
  }

  toggleAdvanced(): void {
    this.showAdvanced = !this.showAdvanced;
  }

  show(): void {
    this.isVisible = true;
  }

  hide(): void {
    this.isVisible = false;
    this.closed.emit();
  }

  getConnectionName(connectionString: string): string {
    if (connectionString.includes("elasticache")) {
      return "AWS ElastiCache";
    }
    if (connectionString.includes("azure")) {
      return "Azure Redis";
    }
    return "Redis Instance";
  }

  private loadRecentConnections(): void {
    const saved = localStorage.getItem("redis-studio-recent-connections");
    if (saved) {
      this.recentConnections = JSON.parse(saved);
    }
  }

  private saveConnection(connectionString: string): void {
    if (!this.recentConnections.includes(connectionString)) {
      this.recentConnections.unshift(connectionString);
      // Keep only last 5 connections
      this.recentConnections = this.recentConnections.slice(0, 5);
      localStorage.setItem(
        "redis-studio-recent-connections",
        JSON.stringify(this.recentConnections)
      );
    }
  }
}
