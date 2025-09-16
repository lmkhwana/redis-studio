import { Component, OnInit, ViewChild } from "@angular/core";
import { RedisService } from "../../services/redis.service";
import { ThemeService } from "../../services/theme.service";
import {
  RedisKey,
  RedisKeyValue,
  CreateKeyRequest,
  ServerInfo,
  KeysPage,
} from "../../abstractions/models/redis.models";
import { KeyEditorPayload } from "../key-editor-modal/key-editor-modal.component";
import { ConnectionModalComponent } from "../connection-modal/connection-modal.component";
import { UI_TEXT } from "../../abstractions/constants/ui.constants";

@Component({
  selector: "app-main-app",
  templateUrl: "./main-app.component.html",
  styleUrls: ["./main-app.component.css"],
})
export class MainAppComponent implements OnInit {
  ui = UI_TEXT;
  @ViewChild("connectionModal") connectionModal?: ConnectionModalComponent;

  isConnected = false;
  connectionStatusText = "Not connected";
  connectionStatusColor = "#f97316";
  serverInfo: ServerInfo | null = null;

  keys: RedisKey[] = [];
  filteredKeys: RedisKey[] = [];
  displayedKeys: RedisKey[] = [];
  selectedKey: RedisKey | null = null;
  selectedKeyValue: RedisKeyValue | null = null;
  isLoadingKeys = false;
  isLoadingValue = false;
  searchPattern = "";
  typeFilter = "";
  // Pagination state
  page = 0;
  pageSize = 9;
  total = 0;
  totalPages = 0;

  Math = Math;

  cliCommand = "";
  lastCommandLatency = 0;

  keyEditorVisible = false;
  editingKey: RedisKey | null = null;
  isSavingKey = false;
  lastFetched: Date | null = null;

  memoryUsagePercent = 0;

  constructor(
    public themeService: ThemeService,
    private redisService: RedisService
  ) {}

  ngOnInit(): void {
    // Attempt to restore previous connection
    this.redisService.initializeFromStorage();
    // After short delay, open modal if still not connected
    setTimeout(() => {
      if (!this.redisService.getCurrentConnectionStatus().isConnected) {
        this.openConnectionModal();
      }
    }, 400);
    this.redisService.connectionStatus$.subscribe((status) => {
      this.isConnected = status.isConnected;
      this.connectionStatusText = status.statusText;
      this.connectionStatusColor = status.isConnected ? "#10b981" : "#f97316";
      if (status.isConnected) {
        this.loadInitialData();
      } else {
        this.resetState();
      }
    });
  }

  private loadInitialData(): void {
    this.refreshKeys();
    this.loadServerInfo();
  }

  private resetState(): void {
    this.keys = [];
    this.filteredKeys = [];
    this.displayedKeys = [];
    this.selectedKey = null;
    this.selectedKeyValue = null;
    this.serverInfo = null;
    this.memoryUsagePercent = 0;
  }

  openConnectionModal(): void {
    this.connectionModal?.show();
  }

  onConnectionEstablished(_connectionId: string): void {
    // Already handled via status subscription
    this.loadInitialData();
  }

  refreshKeys(): void {
    if (!this.isConnected) return;
    this.isLoadingKeys = true;
    this.redisService
      .getKeysPage(this.searchPattern || "*", this.page, this.pageSize)
      .subscribe(
        (kp: KeysPage) => {
          this.keys = kp.items;
          this.total = kp.total;
          this.totalPages = kp.totalPages;
          this.applyFilters();
          this.isLoadingKeys = false;
        },
        () => (this.isLoadingKeys = false)
      );
  }

  onSearchChange(): void {
    this.applyFilters();
  }
  onFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    const pattern = (this.searchPattern || "").toLowerCase();
    // Server handles pattern filtering; just filter by type locally
    this.filteredKeys = this.keys.filter(
      (k) => !this.typeFilter || k.type === this.typeFilter
    );
    console.log("Filtered keys:", this.filteredKeys);
    this.displayedKeys = this.filteredKeys;
  }

  goToPage(p: number): void {
    if (p < 0 || p >= this.totalPages) return;
    this.page = p;
    this.refreshKeys();
  }
  nextPage(): void {
    this.goToPage(this.page + 1);
  }
  prevPage(): void {
    this.goToPage(this.page - 1);
  }
  firstPage(): void {
    this.goToPage(0);
  }
  lastPage(): void {
    this.goToPage(this.totalPages - 1);
  }
  selectKey(key: RedisKey): void {
    this.selectedKey = key;
    this.loadKeyValue(key.key);
  }

  trackByKey(_i: number, item: RedisKey) {
    return item.key;
  }

  private loadKeyValue(key: string): void {
    this.isLoadingValue = true;
    this.redisService.getKey(key).subscribe(
      (value) => {
        this.selectedKeyValue = value;
        this.isLoadingValue = false;
        this.lastFetched = new Date();
      },
      () => (this.isLoadingValue = false)
    );
  }

  getTypeColor(type: string): string {
    switch (type) {
      case "string":
        return "linear-gradient(180deg,#0ea5a4,#2dd4bf)";
      case "hash":
        return "linear-gradient(180deg,#6366f1,#4338ca)";
      case "list":
        return "linear-gradient(180deg,#f59e0b,#d97706)";
      case "set":
        return "linear-gradient(180deg,#ec4899,#db2777)";
      case "zset":
        return "linear-gradient(180deg,#8b5cf6,#7c3aed)";
      default:
        return "linear-gradient(180deg,#334155,#0f172a)";
    }
  }

  getKeyDescription(key: RedisKey): string {
    return `${key.type} • ${key.size}${
      key.ttl ? " • TTL " + key.ttl + "s" : ""
    }`;
  }

  formatValue(value: any): string {
    if (value == null) return "";
    if (typeof value === "object") {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    }
    return String(value);
  }

  openNewKeyDialog(): void {
    this.editingKey = null;
    this.keyEditorVisible = true;
  }

  editSelectedKey(): void {
    if (!this.selectedKey) return;
    this.editingKey = this.selectedKey;
    this.keyEditorVisible = true;
  }

  canEditKey(): boolean {
    return !!this.selectedKey && ["string"].includes(this.selectedKey.type);
  }
  closeKeyEditor(): void {
    this.keyEditorVisible = false;
  }

  onKeyEditorSave(p: KeyEditorPayload): void {
    if (!p.key || !p.value) return;
    this.isSavingKey = true;
    const payload: CreateKeyRequest = {
      key: p.key,
      value: p.value,
      type: p.type,
      ttlSeconds: p.ttlSeconds || undefined,
    };
    const obs = this.editingKey
      ? this.redisService.updateKey(this.editingKey.key, payload)
      : this.redisService.setKey(payload);
    obs.subscribe(
      (success) => {
        this.isSavingKey = false;
        if (success) {
          this.keyEditorVisible = false;
          this.refreshKeys();
          if (this.editingKey) this.loadKeyValue(this.editingKey.key);
        }
      },
      () => (this.isSavingKey = false)
    );
  }

  deleteSelectedKey(): void {
    if (!this.selectedKey) return;
    const keyToDelete = this.selectedKey.key;
    if (!confirm(`Delete key ${keyToDelete}?`)) return;
    this.redisService.deleteKey(keyToDelete).subscribe((success) => {
      if (success) {
        this.selectedKey = null;
        this.selectedKeyValue = null;
        this.refreshKeys();
      }
    });
  }

  disconnect(): void {
    this.redisService.disconnect().subscribe(() => {
      this.resetState();
      this.openConnectionModal();
    });
  }

  exportKey(): void {
    if (!this.selectedKeyValue) return;
    const blob = new Blob([this.formatValue(this.selectedKeyValue.value)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${this.selectedKeyValue.key}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  copyKeyValue(): void {
    if (!this.selectedKeyValue) return;
    navigator.clipboard.writeText(
      this.formatValue(this.selectedKeyValue.value)
    );
  }

  runCliCommand(): void {
    if (!this.cliCommand.trim()) return;
    const start = performance.now();
    setTimeout(() => {
      this.lastCommandLatency = Math.round(performance.now() - start);
      this.cliCommand = "";
    }, 200);
  }

  clearConsole(): void {}

  private loadServerInfo(): void {
    this.redisService.getServerInfo().subscribe((info) => {
      this.serverInfo = info;
      const used = parseFloat((info.used_memory || "").replace(/[^0-9.]/g, ""));
      if (!isNaN(used))
        this.memoryUsagePercent = Math.min(100, Math.round((used / 1024) * 10));
    });
  }
}
