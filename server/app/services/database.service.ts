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
        const DB_URL = 'mongodb+srv://baiwuli:baiwuli@cluster0.wl2p6f7.mongodb.net/?retryWrites=true&w=majority';
        const DRIVER_OPTIONS = { serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: false } };
        this.client = new MongoClient(DB_URL, DRIVER_OPTIONS);

        const disconnect: () => Promise<void> = async () => {
            await this.client.close();
            process.exit(0);
        };

        for (const KILL_SIGNAL of ['SIGINT', 'SIGTERM']) {
            process.on(KILL_SIGNAL, disconnect);
        }
    }
}
