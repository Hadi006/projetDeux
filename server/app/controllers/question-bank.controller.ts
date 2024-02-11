import { DatabaseService } from '@app/services/database.service';
import { Service } from 'typedi';

@Service()
export class QuestionBankService {
    constructor(private database: DatabaseService) {}
}
