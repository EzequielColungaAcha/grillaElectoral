// IndexedDB wrapper for Grilla Electoral
class GrillaDB {
  constructor() {
    this.dbName = 'GrillaElectoralDB';
    this.version = 1;
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

        // Users store
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: '_id' });
          userStore.createIndex('username', 'username', { unique: true });
        }

        // Tables store
        if (!db.objectStoreNames.contains('tables')) {
          const tableStore = db.createObjectStore('tables', { keyPath: '_id' });
          tableStore.createIndex('number', 'number', { unique: true });
        }

        // Persons store
        if (!db.objectStoreNames.contains('persons')) {
          const personStore = db.createObjectStore('persons', { keyPath: '_id' });
          personStore.createIndex('tableId', 'tableId');
          personStore.createIndex('dni', 'dni');
          personStore.createIndex('tableNumber', 'tableNumber');
        }

        // Factions store
        if (!db.objectStoreNames.contains('factions')) {
          const factionStore = db.createObjectStore('factions', { keyPath: '_id' });
          factionStore.createIndex('tableId', 'tableId');
          factionStore.createIndex('configId', 'configId');
        }

        // FactionConfig store
        if (!db.objectStoreNames.contains('factionConfigs')) {
          const factionConfigStore = db.createObjectStore('factionConfigs', { keyPath: '_id' });
          factionConfigStore.createIndex('position', 'position');
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
      // Clear existing data
      await this.clear('users');
      await this.clear('tables');
      await this.clear('persons');
      await this.clear('factions');
      await this.clear('factionConfigs');

      // Keep track of imported faction configs to avoid duplicates
      const importedConfigs = new Map();

      // Import users
      if (data.users) {
        for (const user of data.users) {
          await this.add('users', user);
        }
      }

      // Import tables
      if (data.tables) {
        for (const table of data.tables) {
          const tableData = {
            _id: table._id,
            number: table.number,
            description: table.description,
            status: table.status
          };
          await this.add('tables', tableData);

          // Import persons for this table
          if (table.persons) {
            for (const person of table.persons) {
              // Ensure person has the correct tableId from its parent table
              const personData = {
                ...person,
                tableId: table._id  // Set tableId to the parent table's _id
              };
              await this.add('persons', personData);
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
                const savedConfig = await this.add('factionConfigs', faction.config);
                configId = savedConfig._id;
                importedConfigs.set(configKey, configId);
              }

              const factionData = {
                _id: faction._id,
                configId: configId,
                votes: faction.votes,
                tableId: table._id
              };
              await this.add('factions', factionData);
            }
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }
}

export const db = new GrillaDB();