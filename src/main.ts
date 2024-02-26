import * as fs from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';
import { EventEmitter } from 'events';

const ENCRYPTION_ALGORITHM = 'aes-256-cbc';

interface DatabaseData {
    [key: string]: any;
}

interface DatabaseEvents {
    saved: (filePath: string) => void;
    error: (error: Error) => void;
    recordAdded: (key: string, value: any) => void;
    recordDeleted: (key: string) => void;
    databaseCleared: () => void;
}

class SecureDatabase extends EventEmitter {
    private filePath: string;
    private encryptionKey: string;

    /**
     * Class constructor SecureDatabase
     * @param folderPath - path to the folder where the database file will be stored
     * @param filename - database file name
     * @param encryptionKey - data encryption key
     */
    constructor(folderPath: string, filename: string, encryptionKey: string) {
        super();
        this.filePath = path.join(folderPath, filename);
        this.encryptionKey = encryptionKey;
        if (!fs.existsSync(this.filePath)) {
            this.saveData({});
        }
    }

    /**
     * Encrypts data
     * @param data - data to be encrypted
     * @returns encrypted data
     */
    private encrypt(data: string): string {
        const cipher = crypto.createCipher(ENCRYPTION_ALGORITHM, this.encryptionKey);
        let encryptedData = cipher.update(data, 'utf8', 'hex');
        encryptedData += cipher.final('hex');
        return encryptedData;
    }

    /**
     * Decrypts data
     * @param data - encrypted data
     * @returns decrypted data
     */
    private decrypt(data: string): string {
        const decipher = crypto.createDecipher(ENCRYPTION_ALGORITHM, this.encryptionKey);
        let decryptedData = decipher.update(data, 'hex', 'utf8');
        decryptedData += decipher.final('utf8');
        return decryptedData;
    }

    /**
     * Saves data to a file
     * @param data - data to save
     */
    public saveData(data: DatabaseData): void {
        try {
            const jsonData = JSON.stringify(data);
            const encryptedData = this.encrypt(jsonData);
            fs.writeFileSync(this.filePath, encryptedData);
            this.emit('saved', this.filePath);
        } catch (error) {
            this.emit('error', error);
        }
    }

    /**
     * Loads data from a file
     * @returns downloaded data
     */
    public loadData(): DatabaseData {
        try {
            const encryptedData = fs.readFileSync(this.filePath, 'utf8');
            const decryptedData = this.decrypt(encryptedData);
            return JSON.parse(decryptedData);
        } catch (error) {
            this.emit('error', error);
            return {};
        }
    }

    /**
     * Adds an entry to the database
     * @param key - write keys
     * @param value - record value
     */
    public addRecord(key: string, value: any): void {
        const data = this.loadData();
        data[key] = value;
        this.saveData(data);
        this.emit('recordAdded', key, value);
    }

    /**
     * Deletes a record from the database
     * @param key - write key to delete
     */
    public deleteRecord(key: string): void {
        const data = this.loadData();
        if (data.hasOwnProperty(key)) {
            delete data[key];
            this.saveData(data);
            this.emit('recordDeleted', key);
        } else {
            console.error('Record with key ' + key + ' does not exist.');
        }
    }

    /**
     * Clear db
     */
    public clearDatabase(): void {
        this.saveData({});
        this.emit('databaseCleared');
    }

    /**
     * Get all key in db
     * @returns array all keys
     */
    public getAllKeys(): string[] {
        const data = this.loadData();
        return Object.keys(data);
    }
}

export default SecureDatabase;
              
