import { DB_URL } from '@common/constant';
import { Db, MongoClient, ServerApiVersion } from 'mongodb';
import { Service } from 'typedi';

@Service()
export class DatabaseService {
    private client: MongoClient;
    private db: Db;

    /**
     * @Source https://stackoverflow.com/questions/46908853/process-onsigint-multiple-termination-signals
     */
    constructor() {
        this.client = new MongoClient(DB_URL, { serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: false } });

        for (const killSignal of ['SIGINT', 'SIGTERM']) {
            process.on(killSignal, async () => {
                await this.client.close();
                process.exit(0);
            });
        }
    }

    async connect(): Promise<void> {
        try {
            await this.client.connect();
            this.db = this.client.db('log2990');
        } catch (error) {
            return;
        }
    }

    async get<T>(collection: string, query: object = {}, projection: object = {}): Promise<T[]> {
        console.log(query);
        return (this.db
            ?.collection(collection)
            ?.find(query)
            ?.project({ _id: 0, ...projection })
            ?.toArray() || []) as T[];
    }

    async add<T>(collection: string, data: T): Promise<T> {
        this.db?.collection(collection)?.insertOne(data);
        return data;
    }

    async update(collection: string, query: object, update: object): Promise<boolean> {
        return !!(await this.db?.collection(collection)?.findOneAndUpdate(query, update));
    }

    async delete(collection: string, query: object): Promise<boolean> {
        return (await this.db?.collection(collection)?.deleteMany(query))?.deletedCount ? true : false;
    }
}
