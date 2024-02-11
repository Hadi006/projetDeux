import { Service } from 'typedi';
import { DatabaseService } from './database.service';

@Service()
export class AuthService {
    constructor(private database: DatabaseService) {}
}
