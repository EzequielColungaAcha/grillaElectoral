// IndexedDB wrapper for Grilla Electoral
class GrillaDB {
  constructor() {
    this.dbName = 'GrillaElectoralDB';
    this.version = 5;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const oldVersion = event.oldVersion;

        // Users store
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: '_id' });
          userStore.createIndex('username', 'username', { unique: true });
        } else if (oldVersion < 4) {
          // Ensure indexes exist on existing store
          const transaction = event.target.transaction;
          const userStore = transaction.objectStore('users');
          if (!userStore.indexNames.contains('username')) {
            userStore.createIndex('username', 'username', { unique: true });
          }
        }

        // Tables store
        if (!db.objectStoreNames.contains('tables')) {
          const tableStore = db.createObjectStore('tables', { keyPath: '_id' });
          tableStore.createIndex('number', 'number', { unique: true });
        } else if (oldVersion < 4) {
          // Ensure indexes exist on existing store
          const transaction = event.target.transaction;
          const tableStore = transaction.objectStore('tables');
          if (!tableStore.indexNames.contains('number')) {
            tableStore.createIndex('number', 'number', { unique: true });
          }
        }

        // Persons store
        if (!db.objectStoreNames.contains('persons')) {
          const personStore = db.createObjectStore('persons', {
            keyPath: '_id',
          });
          personStore.createIndex('tableId', 'tableId');
          personStore.createIndex('dni', 'dni');
          personStore.createIndex('tableNumber', 'tableNumber');
        } else if (oldVersion < 4) {
          // Ensure indexes exist on existing store
          const transaction = event.target.transaction;
          const personStore = transaction.objectStore('persons');
          if (!personStore.indexNames.contains('tableId')) {
            personStore.createIndex('tableId', 'tableId');
          }
          if (!personStore.indexNames.contains('dni')) {
            personStore.createIndex('dni', 'dni');
          }
          if (!personStore.indexNames.contains('tableNumber')) {
            personStore.createIndex('tableNumber', 'tableNumber');
          }
        }

        // Factions store
        if (!db.objectStoreNames.contains('factions')) {
          const factionStore = db.createObjectStore('factions', {
            keyPath: '_id',
          });
          factionStore.createIndex('tableId', 'tableId');
          factionStore.createIndex('configId', 'configId');
        } else if (oldVersion < 4) {
          // Ensure indexes exist on existing store
          const transaction = event.target.transaction;
          const factionStore = transaction.objectStore('factions');
          if (!factionStore.indexNames.contains('tableId')) {
            factionStore.createIndex('tableId', 'tableId');
          }
          if (!factionStore.indexNames.contains('configId')) {
            factionStore.createIndex('configId', 'configId');
          }
        }

        // FactionConfig store
        if (!db.objectStoreNames.contains('factionConfigs')) {
          const factionConfigStore = db.createObjectStore('factionConfigs', {
            keyPath: '_id',
          });
          factionConfigStore.createIndex('position', 'position');
        } else if (oldVersion < 5) {
          // Ensure indexes exist on existing store
          const transaction = event.target.transaction;
          const factionConfigStore = transaction.objectStore('factionConfigs');
          if (!factionConfigStore.indexNames.contains('position')) {
            factionConfigStore.createIndex('position', 'position');
          }
        }

        // Logs store
        if (!db.objectStoreNames.contains('logs')) {
          const logsStore = db.createObjectStore('logs', { keyPath: 'id' });
          logsStore.createIndex('timestamp', 'timestamp');
          logsStore.createIndex('action', 'action');
          logsStore.createIndex('level', 'level');
        }

        // Export info store
        if (!db.objectStoreNames.contains('exportInfo')) {
          db.createObjectStore('exportInfo', { keyPath: '_id' });
        }

        // Multi-file import store
        if (!db.objectStoreNames.contains('multiFileImport')) {
          const multiFileStore = db.createObjectStore('multiFileImport', {
            keyPath: '_id',
          });
          multiFileStore.createIndex('dni', 'dni');
        }

        // Update existing stores if needed
        if (oldVersion < 5) {
          // Ensure indexes exist on existing store
          if (db.objectStoreNames.contains('logs')) {
            const transaction = event.target.transaction;
            const logsStore = transaction.objectStore('logs');
            if (!logsStore.indexNames.contains('timestamp')) {
              logsStore.createIndex('timestamp', 'timestamp');
            }
            if (!logsStore.indexNames.contains('action')) {
              logsStore.createIndex('action', 'action');
            }
            if (!logsStore.indexNames.contains('level')) {
              logsStore.createIndex('level', 'level');
            }
          }
        }
      };
    });
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async add(storeName, data) {
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    if (!data._id) {
      data._id = this.generateId();
    }
    data.createdAt = new Date().toISOString();
    data.updatedAt = new Date().toISOString();

    return new Promise((resolve, reject) => {
      const request = store.add(data);
      request.onsuccess = () => resolve(data);
      request.onerror = () => reject(request.error);
    });
  }

  async importRecord(storeName, data) {
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    if (!data._id) {
      data._id = this.generateId();
    }

    // Preserve existing timestamps if they exist, otherwise create new ones
    if (!data.createdAt) {
      data.createdAt = new Date().toISOString();
    }
    if (!data.updatedAt) {
      data.updatedAt = new Date().toISOString();
    }

    return new Promise((resolve, reject) => {
      const request = store.add(data);
      request.onsuccess = () => resolve(data);
      request.onerror = () => reject(request.error);
    });
  }

  async update(storeName, data) {
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    data.updatedAt = new Date().toISOString();

    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve(data);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, id) {
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async get(storeName, id) {
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName) {
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex(storeName, indexName, value) {
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);

    return new Promise((resolve, reject) => {
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async count(storeName) {
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName) {
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async importData(data) {
    try {
      console.log('Starting data import...');
      console.log('Data structure:', Object.keys(data));
      console.log('Export info:', data.exportInfo);
      console.log('Logs data:', data.logs);

      // Clear existing data
      await this.clear('users');
      await this.clear('tables');
      await this.clear('persons');
      await this.clear('factions');
      await this.clear('factionConfigs');
      await this.clear('logs');
      await this.clear('exportInfo');

      // Handle multi-file import
      if (data.multiFileImport) {
        console.log('Processing multi-file import...');

        // Store the multi-file data
        await this.add('multiFileImport', {
          _id: 'multi_file_data',
          ...data.multiFileImport,
        });

        console.log('Multi-file import completed');
        return true;
      }

      // Store export info if available
      if (data.exportInfo) {
        await this.add('exportInfo', {
          _id: 'export_metadata',
          ...data.exportInfo,
        });
      }

      // Keep track of imported faction configs to avoid duplicates
      const importedConfigs = new Map();

      // Import users
      if (data.users) {
        console.log('Importing users:', data.users.length);
        for (const user of data.users) {
          await this.add('users', user);
        }
      }

      // Import tables
      if (data.tables) {
        console.log('Importing tables:', data.tables.length);
        for (const table of data.tables) {
          const tableData = {
            _id: table._id,
            number: table.number,
            description: table.description,
            status: table.status,
          };
          await this.add('tables', tableData);

          // Import persons for this table
          if (table.persons) {
            for (const person of table.persons) {
              // Ensure person has the correct tableId from its parent table
              const personData = {
                ...person,
                tableId: table._id, // Set tableId to the parent table's _id
              };
              // Use a special import method that preserves timestamps
              await this.importRecord('persons', personData);
            }
          }

          // Import factions for this table
          if (table.factions) {
            for (const faction of table.factions) {
              // Check if faction config already exists by name, color, and position
              const configKey = `${faction.config.name}-${faction.config.color}-${faction.config.position}`;
              let configId = importedConfigs.get(configKey);

              if (!configId) {
                // Import new faction config
                const savedConfig = await this.add(
                  'factionConfigs',
                  faction.config
                );
                configId = savedConfig._id;
                importedConfigs.set(configKey, configId);
              }

              const factionData = {
                _id: faction._id,
                configId: configId,
                votes: faction.votes,
                tableId: table._id,
              };
              await this.add('factions', factionData);
            }
          }
        }
      }

      // Import logs
      console.log('Importing logs from entries:', data.logs.entries.length);
      console.log('Checking logs data structure...');
      console.log('data.logs exists:', !!data.logs);
      console.log(
        'data.logs.entries exists:',
        !!(data.logs && data.logs.entries)
      );
      console.log('data.logs.logs exists:', !!(data.logs && data.logs.logs));

      if (data.logs && data.logs.entries && Array.isArray(data.logs.entries)) {
        console.log(
          'Importing logs from entries array:',
          data.logs.entries.length
        );
        for (const log of data.logs.entries) {
          // Clean up GraphQL typename fields
          const cleanLog = { ...log };
          delete cleanLog.__typename;
          if (cleanLog.user) delete cleanLog.user.__typename;
          if (cleanLog.target) delete cleanLog.target.__typename;

          // Ensure log has required fields
          if (!cleanLog.id) {
            cleanLog.id = this.generateId();
          }

          console.log('Adding log:', cleanLog.id, cleanLog.action);
          await this.add('logs', cleanLog);
        }
      } else if (data.logs && data.logs.logs && Array.isArray(data.logs.logs)) {
        console.log('Importing logs from logs array:', data.logs.logs.length);
        for (const log of data.logs.logs) {
          // Clean up GraphQL typename fields
          const cleanLog = { ...log };
          delete cleanLog.__typename;
          if (cleanLog.user) delete cleanLog.user.__typename;
          if (cleanLog.target) delete cleanLog.target.__typename;

          // Ensure log has required fields
          if (!cleanLog.id) {
            cleanLog.id = this.generateId();
          }

          console.log('Adding log:', cleanLog.id, cleanLog.action);
          await this.add('logs', cleanLog);
        }
      } else if (data.logs && Array.isArray(data.logs)) {
        console.log('Importing logs from direct array:', data.logs.length);
        for (const log of data.logs) {
          // Clean up GraphQL typename fields
          const cleanLog = { ...log };
          delete cleanLog.__typename;
          if (cleanLog.user) delete cleanLog.user.__typename;
          if (cleanLog.target) delete cleanLog.target.__typename;

          // Ensure log has required fields
          if (!cleanLog.id) {
            cleanLog.id = this.generateId();
          }

          console.log('Adding log:', cleanLog.id, cleanLog.action);
          await this.add('logs', cleanLog);
        }
      } else {
        console.log('No logs found to import. Data.logs structure:', data.logs);
      }

      console.log('Import completed successfully');
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }
}

export const db = new GrillaDB();
