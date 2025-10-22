
import { Grant } from '../types';

const DB_NAME = 'ZodiacAIAppDB';
const DB_VERSION = 1;
const STORE_NAME = 'grants';

let db: IDBDatabase;

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(true);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', request.error);
      reject('Error opening IndexedDB.');
    };

    request.onsuccess = (event) => {
      db = request.result;
      resolve(true);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        dbInstance.createObjectStore(STORE_NAME, { keyPath: 'link' });
      }
    };
  });
};

export const addGrants = (grants: Grant[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      return reject('DB not initialized.');
    }
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    transaction.onerror = () => {
      console.error('Transaction error:', transaction.error);
      reject('Error adding grants.');
    };
    
    transaction.oncomplete = () => {
      resolve();
    };

    grants.forEach(grant => {
      store.put(grant);
    });
  });
};

export const getAllGrants = (): Promise<Grant[]> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      return reject('DB not initialized.');
    }
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => {
      console.error('Get all grants error:', request.error);
      reject('Error fetching all grants.');
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
};

export const clearAllGrants = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!db) {
            return reject('DB not initialized.');
        }
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onerror = () => {
            console.error('Clear all grants error:', request.error);
            reject('Error clearing grants.');
        };

        request.onsuccess = () => {
            resolve();
        };
    });
};
