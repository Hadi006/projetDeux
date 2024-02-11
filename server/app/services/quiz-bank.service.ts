import { DatabaseService } from '@app/services/database.service';
import { Service } from 'typedi';

@Service()
export class QuizBankService {
    constructor(private database: DatabaseService) {}
}
