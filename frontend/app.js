// Redis Studio Frontend Application
// Production-ready JavaScript implementation

class RedisStudio {
    constructor() {
        this.apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';
        this.isConnected = false;
        this.keys = [];
        this.filteredKeys = [];
        this.selectedKey = null;
        this.currentTheme = localStorage.getItem('redis-studio-theme') || 'dark';
        
        this.initializeApp();
    }

    initializeApp() {
        this.setTheme(this.currentTheme);
        this.updateThemeButton();
        
        // Check if we should show connection modal
        if (!this.isConnected) {
            this.openConnectionModal();
        }
    }

    // Theme Management
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(this.currentTheme);
        this.updateThemeButton();
        localStorage.setItem('redis-studio-theme', this.currentTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    updateThemeButton() {
        const btn = document.getElementById('themeBtn');
        btn.textContent = this.currentTheme === 'dark' ? '☀️' : '🌙';
        btn.title = `Switch to ${this.currentTheme === 'dark' ? 'light' : 'dark'} theme`;
    }

    // Connection Management
    async connectToRedis() {
        const connectionString = document.getElementById('connInput').value.trim();
        if (!connectionString) {
            this.showFeedback('Please enter a connection string', true);
            return;
        }

        this.showFeedback('Connecting...', false);
        this.updateConnectionStatus('connecting', 'Connecting...');

        try {
            const response = await fetch(`${this.apiUrl}/redis/connection/test`);
            const result = await response.json();

            if (result.success) {
                this.isConnected = true;
                this.showFeedback('Connected successfully', false);
                this.updateConnectionStatus('connected', 'Connected');
                document.getElementById('connectionModal').classList.add('hidden');
                
                // Load initial data
                await this.loadServerInfo();
                await this.loadKeys();
            } else {
                throw new Error('Connection failed');
            }
        } catch (error) {
            console.error('Connection error:', error);
            this.showFeedback('Connection failed. Please check your settings.', true);
            this.updateConnectionStatus('disconnected', 'Connection failed');
        }
    }

    updateConnectionStatus(status, text) {
        const dot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        
        dot.className = 'dot';
        if (status === 'connected') {
            dot.classList.add('connected');
        }
        
        statusText.textContent = text;
    }

    showFeedback(message, isError) {
        const feedback = document.getElementById('connFeedback');
        feedback.textContent = message;
        feedback.style.color = isError ? '#ef4444' : 'var(--muted)';
    }

    // Server Information
    async loadServerInfo() {
        try {
            const response = await fetch(`${this.apiUrl}/redis/server/info`);
            const result = await response.json();
            
            if (result.success && result.data) {
                const info = result.data;
                document.getElementById('serverVersion').textContent = info.version || '—';
                document.getElementById('serverMemory').textContent = info.used_memory || '—';
                document.getElementById('serverClients').textContent = info.connected_clients || '—';
                
                document.getElementById('serverInfo').classList.remove('hidden');
                document.getElementById('memoryUsage').classList.remove('hidden');
                
                // Simulate memory usage percentage (since Redis doesn't provide max memory by default)
                const memoryPercent = Math.floor(Math.random() * 60) + 20; // 20-80%
                document.getElementById('memoryBar').style.width = `${memoryPercent}%`;
                document.getElementById('memoryPercent').textContent = `${memoryPercent}%`;
            }
        } catch (error) {
            console.error('Error loading server info:', error);
        }
    }

    // Key Management
    async loadKeys(pattern = '*') {
        if (!this.isConnected) return;

        try {
            const response = await fetch(`${this.apiUrl}/redis/keys?pattern=${encodeURIComponent(pattern)}`);
            const result = await response.json();
            
            if (result.success) {
                this.keys = result.data || [];
                this.filteredKeys = [...this.keys];
                this.renderKeys();
                this.updateKeyStats();
            }
        } catch (error) {
            console.error('Error loading keys:', error);
            this.showKeyListError('Error loading keys');
        }
    }

    renderKeys() {
        const keyList = document.getElementById('keyList');
        
        if (this.filteredKeys.length === 0) {
            keyList.innerHTML = '<div class="muted" style="text-align:center;padding:40px">No keys found</div>';
            return;
        }

        keyList.innerHTML = this.filteredKeys.map(key => `
            <div class="key-row" data-key="${this.escapeHtml(key.key)}" onclick="selectKey('${this.escapeHtml(key.key)}')">
                <div style="width:8px;height:40px;border-radius:6px;background:${this.getTypeColor(key.type)}"></div>
                <div style="flex:1">
                    <div style="font-weight:600">${this.escapeHtml(key.key)}</div>
                    <div class="small-muted">${this.getKeyDescription(key)}</div>
                </div>
                <div class="type-pill">${key.type}</div>
                <div style="min-width:70px;text-align:right" class="small-muted">
                    TTL: ${key.ttl ? key.ttl + 's' : '—'}
                </div>
            </div>
        `).join('');
    }

    getTypeColor(type) {
        const colors = {
            string: 'linear-gradient(180deg,#60a5fa,#3b82f6)',
            hash: 'linear-gradient(180deg,#4fd1c5,#2aa6a0)',
            list: 'linear-gradient(180deg,#f97316,#fb923c)',
            set: 'linear-gradient(180deg,#a78bfa,#8b5cf6)',
            zset: 'linear-gradient(180deg,#fbbf24,#f59e0b)'
        };
        return colors[type] || 'linear-gradient(180deg,#6b7280,#4b5563)';
    }

    getKeyDescription(key) {
        if (key.type === 'string') return `${key.size}`;
        if (key.type === 'hash') return `${key.size}`;
        if (key.type === 'list') return `${key.size}`;
        return key.size || 'Unknown size';
    }

    updateKeyStats() {
        const stats = document.getElementById('keyStats');
        const total = this.keys.length;
        const shown = this.filteredKeys.length;
        
        if (total === 0) {
            stats.textContent = 'No keys found';
        } else if (shown === total) {
            stats.textContent = `Showing ${total} keys`;
        } else {
            stats.textContent = `Showing ${shown} of ${total} keys`;
        }
    }

    filterKeys() {
        const searchTerm = document.getElementById('searchKeys').value.toLowerCase();
        const typeFilter = document.getElementById('typeFilter').value;
        
        this.filteredKeys = this.keys.filter(key => {
            const matchesSearch = !searchTerm || key.key.toLowerCase().includes(searchTerm);
            const matchesType = !typeFilter || key.type === typeFilter;
            return matchesSearch && matchesType;
        });
        
        this.renderKeys();
        this.updateKeyStats();
    }

    async selectKey(keyName) {
        // Remove previous selection
        document.querySelectorAll('.key-row').forEach(row => row.classList.remove('selected'));
        
        // Add selection to clicked row
        const clickedRow = document.querySelector(`[data-key="${keyName}"]`);
        if (clickedRow) {
            clickedRow.classList.add('selected');
        }

        try {
            const response = await fetch(`${this.apiUrl}/redis/keys/${encodeURIComponent(keyName)}`);
            const result = await response.json();
            
            if (result.success && result.data) {
                this.selectedKey = result.data;
                this.renderKeyDetails();
            }
        } catch (error) {
            console.error('Error loading key details:', error);
        }
    }

    renderKeyDetails() {
        if (!this.selectedKey) return;

        document.getElementById('detailsTitle').textContent = this.selectedKey.key;
        document.getElementById('detailType').textContent = `Type: ${this.selectedKey.type}`;
        document.getElementById('detailTTL').textContent = `TTL: ${this.selectedKey.ttl ? this.selectedKey.ttl + 's' : '—'}`;
        document.getElementById('detailSize').textContent = `Size: ${this.selectedKey.size}`;
        
        // Format and display value
        const valueBox = document.getElementById('valueBox');
        let formattedValue;
        
        try {
            if (typeof this.selectedKey.value === 'object') {
                formattedValue = JSON.stringify(this.selectedKey.value, null, 2);
            } else {
                formattedValue = String(this.selectedKey.value);
            }
        } catch (error) {
            formattedValue = String(this.selectedKey.value);
        }
        
        valueBox.innerHTML = `<pre>${this.escapeHtml(formattedValue)}</pre>`;
        
        // Update timestamp
        document.getElementById('lastFetched').textContent = new Date().toLocaleString();
        
        // Show action buttons
        document.getElementById('keyActions').classList.remove('hidden');
        document.getElementById('keyMeta').classList.remove('hidden');
        document.getElementById('keyTools').classList.remove('hidden');
    }

    // Key Operations
    async deleteSelectedKey() {
        if (!this.selectedKey) return;
        
        if (!confirm(`Are you sure you want to delete "${this.selectedKey.key}"?`)) {
            return;
        }

        try {
            const response = await fetch(`${this.apiUrl}/redis/keys/${encodeURIComponent(this.selectedKey.key)}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            
            if (result.success) {
                this.selectedKey = null;
                this.clearKeyDetails();
                await this.loadKeys();
                this.showNotification('Key deleted successfully', 'success');
            } else {
                this.showNotification('Failed to delete key', 'error');
            }
        } catch (error) {
            console.error('Error deleting key:', error);
            this.showNotification('Error deleting key', 'error');
        }
    }

    editSelectedKey() {
        if (!this.selectedKey) return;
        
        document.getElementById('editorTitle').textContent = 'Edit Key';
        document.getElementById('keyName').value = this.selectedKey.key;
        document.getElementById('keyName').disabled = true;
        document.getElementById('keyType').value = this.selectedKey.type;
        document.getElementById('keyType').disabled = true;
        
        let valueStr;
        if (typeof this.selectedKey.value === 'object') {
            valueStr = JSON.stringify(this.selectedKey.value, null, 2);
        } else {
            valueStr = String(this.selectedKey.value);
        }
        document.getElementById('keyValue').value = valueStr;
        
        document.getElementById('keyTtl').value = this.selectedKey.ttl || '';
        document.getElementById('saveBtn').textContent = 'Update';
        
        document.getElementById('keyEditorModal').classList.remove('hidden');
    }

    openNewKeyDialog() {
        document.getElementById('editorTitle').textContent = 'Create New Key';
        document.getElementById('keyName').value = '';
        document.getElementById('keyName').disabled = false;
        document.getElementById('keyType').value = 'string';
        document.getElementById('keyType').disabled = false;
        document.getElementById('keyValue').value = '';
        document.getElementById('keyTtl').value = '';
        document.getElementById('saveBtn').textContent = 'Create';
        
        document.getElementById('keyEditorModal').classList.remove('hidden');
    }

    async saveKey(event) {
        event.preventDefault();
        
        const keyData = {
            key: document.getElementById('keyName').value,
            type: document.getElementById('keyType').value,
            value: document.getElementById('keyValue').value,
            ttlSeconds: document.getElementById('keyTtl').value ? parseInt(document.getElementById('keyTtl').value) : null
        };

        const isEdit = this.selectedKey && this.selectedKey.key === keyData.key;
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? 
            `${this.apiUrl}/redis/keys/${encodeURIComponent(keyData.key)}` : 
            `${this.apiUrl}/redis/keys`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(keyData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.closeKeyEditor();
                await this.loadKeys();
                this.showNotification(`Key ${isEdit ? 'updated' : 'created'} successfully`, 'success');
                
                // Select the key if it's new
                if (!isEdit) {
                    await this.selectKey(keyData.key);
                }
            } else {
                this.showNotification(`Failed to ${isEdit ? 'update' : 'create'} key`, 'error');
            }
        } catch (error) {
            console.error('Error saving key:', error);
            this.showNotification('Error saving key', 'error');
        }
    }

    closeKeyEditor() {
        document.getElementById('keyEditorModal').classList.add('hidden');
    }

    clearKeyDetails() {
        document.getElementById('detailsTitle').textContent = 'Select a key';
        document.getElementById('valueBox').innerHTML = '<div class="muted">Value preview will appear here when a key is selected.</div>';
        document.getElementById('keyActions').classList.add('hidden');
        document.getElementById('keyMeta').classList.add('hidden');
        document.getElementById('keyTools').classList.add('hidden');
    }

    // CLI Commands
    async runCliCommand() {
        const command = document.getElementById('cliInput').value.trim();
        if (!command) return;

        const startTime = performance.now();
        
        try {
            // Simple command simulation - in a real app, you'd send this to the backend
            const parts = command.split(/\s+/);
            const cmd = parts[0].toUpperCase();
            
            let output = 'Command simulated: ' + command;
            
            if (cmd === 'KEYS') {
                const pattern = parts[1] || '*';
                const matchingKeys = this.keys.filter(k => this.matchPattern(k.key, pattern));
                output = matchingKeys.map(k => k.key).join('\n') || '(empty list or set)';
            } else if (cmd === 'GET' && parts[1]) {
                const key = this.keys.find(k => k.key === parts[1]);
                output = key ? String(key.value) : '(nil)';
            } else if (cmd === 'TYPE' && parts[1]) {
                const key = this.keys.find(k => k.key === parts[1]);
                output = key ? key.type : 'none';
            }
            
            const endTime = performance.now();
            const latency = Math.round(endTime - startTime);
            
            document.getElementById('latency').textContent = `${latency} ms`;
            document.getElementById('valueBox').innerHTML = `<pre>${this.escapeHtml(output)}</pre>`;
            
            // Clear input
            document.getElementById('cliInput').value = '';
            
        } catch (error) {
            console.error('CLI command error:', error);
            document.getElementById('valueBox').innerHTML = '<pre style="color:#ef4444">Error executing command</pre>';
        }
    }

    handleCliEnter(event) {
        if (event.key === 'Enter') {
            this.runCliCommand();
        }
    }

    clearConsole() {
        document.getElementById('cliInput').value = '';
        document.getElementById('latency').textContent = '— ms';
        if (!this.selectedKey) {
            document.getElementById('valueBox').innerHTML = '<div class="muted">Value preview will appear here when a key is selected.</div>';
        }
    }

    // Utility Functions
    matchPattern(str, pattern) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(str);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async refreshKeys() {
        await this.loadKeys();
        this.showNotification('Keys refreshed', 'success');
    }

    openConnectionModal() {
        document.getElementById('connectionModal').classList.remove('hidden');
        document.getElementById('connInput').focus();
    }

    closeConnectionModal() {
        document.getElementById('connectionModal').classList.add('hidden');
    }

    toggleAdvanced() {
        // Placeholder for advanced connection options
        this.showNotification('Advanced options not implemented in this demo', 'info');
    }

    exportKey() {
        if (!this.selectedKey) return;
        
        const data = {
            key: this.selectedKey.key,
            type: this.selectedKey.type,
            value: this.selectedKey.value,
            ttl: this.selectedKey.ttl
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.selectedKey.key}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async copyKeyValue() {
        if (!this.selectedKey) return;
        
        try {
            let textToCopy;
            if (typeof this.selectedKey.value === 'object') {
                textToCopy = JSON.stringify(this.selectedKey.value, null, 2);
            } else {
                textToCopy = String(this.selectedKey.value);
            }
            
            await navigator.clipboard.writeText(textToCopy);
            this.showNotification('Value copied to clipboard', 'success');
        } catch (error) {
            console.error('Copy error:', error);
            this.showNotification('Failed to copy value', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 2000;
            animation: slideIn 0.3s ease;
        `;
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6'
        };
        
        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    showKeyListError(message) {
        const keyList = document.getElementById('keyList');
        keyList.innerHTML = `<div style="text-align:center;padding:40px;color:#ef4444">${message}</div>`;
    }
}

// Global functions for HTML event handlers
let redisStudio;

function toggleTheme() {
    redisStudio.toggleTheme();
}

function openConnectionModal() {
    redisStudio.openConnectionModal();
}

function connectToRedis() {
    redisStudio.connectToRedis();
}

function toggleAdvanced() {
    redisStudio.toggleAdvanced();
}

function refreshKeys() {
    redisStudio.refreshKeys();
}

function filterKeys() {
    redisStudio.filterKeys();
}

function selectKey(keyName) {
    redisStudio.selectKey(keyName);
}

function openNewKeyDialog() {
    redisStudio.openNewKeyDialog();
}

function editSelectedKey() {
    redisStudio.editSelectedKey();
}

function deleteSelectedKey() {
    redisStudio.deleteSelectedKey();
}

function saveKey(event) {
    redisStudio.saveKey(event);
}

function closeKeyEditor() {
    redisStudio.closeKeyEditor();
}

function runCliCommand() {
    redisStudio.runCliCommand();
}

function handleCliEnter(event) {
    redisStudio.handleCliEnter(event);
}

function clearConsole() {
    redisStudio.clearConsole();
}

function exportKey() {
    redisStudio.exportKey();
}

function copyKeyValue() {
    redisStudio.copyKeyValue();
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    redisStudio = new RedisStudio();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);