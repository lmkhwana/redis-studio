// Centralized UI strings and labels
export const UI_TEXT = {
  app: {
    title: 'Redis Studio',
    subtitle: 'Redis GUI - CLOUD'
  },
  connection: {
    connectTitle: 'Connect to Redis',
    connectDescription: 'Paste a connection string or endpoint for local, cloud, or cluster instances.',
    example: 'redis://:password@127.0.0.1:6379/0',
    placeholder: 'redis://localhost:6379 or host:port or redis+tls://...',
    saveLabel: 'Save connection',
    recent: 'Recent Connections',
    securityTls: 'TLS enabled',
    securityOptional: 'TLS optional'
  },
  keys: {
    header: 'Keys',
    empty: 'No keys found',
    loading: 'Loading keys...',
    createFirst: 'Create First Key',
    page: 'Page',
    of: 'of'
  },
  details: {
    selectPrompt: 'Select a key',
    valuePlaceholder: 'Value preview will appear here when a key is selected.',
    loadingValue: 'Loading value...'
  },
  editor: {
    createTitle: 'Create New Key',
    editTitle: 'Edit Key',
    keyName: 'Key Name',
    keyType: 'Type',
    value: 'Value',
    ttl: 'TTL (seconds, optional)',
    cancel: 'Cancel',
    create: 'Create',
    update: 'Update',
    saving: 'Saving...'
  },
  actions: {
    refresh: 'Refresh',
    newKey: 'New Key',
    export: 'Export',
    copy: 'Copy',
    disconnect: 'Disconnect',
    connect: 'Connect',
    close: 'Close'
  }
} as const;

export type UIText = typeof UI_TEXT;
