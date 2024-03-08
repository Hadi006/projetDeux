import { Service } from 'typedi';
import { DatabaseService } from './database.service';

@Service()
export class LobbiesService {
    constructor(private database: DatabaseService) {}
}
