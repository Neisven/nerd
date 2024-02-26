declare module 'secure-database' {
    import { EventEmitter } from 'events';

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
        constructor(folderPath: string, filename: string, encryptionKey: string);
        saveData(data: DatabaseData): void;
        loadData(): DatabaseData;
        addRecord(key: string, value: any): void;
        deleteRecord(key: string): void;
        clearDatabase(): void;
        getAllKeys(): string[];
        on<U extends keyof DatabaseEvents>(event: U, listener: DatabaseEvents[U]): this;
    }

    export default SecureDatabase;
}
