import { DatabaseService } from '@app/services/database.service';
import { expect } from 'chai';
import { Collection, Db, FindCursor, MongoClient, ObjectId } from 'mongodb';
import { SinonStubbedInstance, createStubInstance, stub } from 'sinon';

describe('DatabaseService', () => {
    let databaseService: DatabaseService;
    let mongoClientStub: SinonStubbedInstance<MongoClient>;
    let dbStub: SinonStubbedInstance<Db>;
    let collectionStub: SinonStubbedInstance<Collection>;
    let findCursorStub: SinonStubbedInstance<FindCursor>;

    beforeEach(async () => {
        databaseService = new DatabaseService();
        mongoClientStub = createStubInstance(MongoClient);

        dbStub = createStubInstance(Db);
        mongoClientStub.db.returns(dbStub);

        collectionStub = createStubInstance(Collection);
        dbStub.collection.returns(collectionStub);

        findCursorStub = createStubInstance(FindCursor);
        findCursorStub.project.returns(findCursorStub);
        findCursorStub.toArray.resolves([]);
        collectionStub.find.returns(findCursorStub);

        databaseService['client'] = mongoClientStub;
        databaseService['db'] = dbStub;
    });

    afterEach(() => {
        process.removeAllListeners('SIGINT');
        process.removeAllListeners('SIGTERM');
    });

    it('should end mongo connection gracefully on SIGINT and SIGTERM', async () => {
        stub(process, 'exit');
        process.emit('SIGINT');
        expect(mongoClientStub.close.calledOnce).to.equal(true);
        process.emit('SIGTERM');
        expect(mongoClientStub.close.calledTwice).to.equal(true);
    });

    it('should connect to the database', async () => {
        databaseService['db'] = undefined;
        await databaseService.connect();
        expect(mongoClientStub.connect.calledOnce).to.equal(true);
        expect(databaseService['db']).to.equal(dbStub);
    });

    it('should do nothing if an error occurs while connecting', async () => {
        databaseService['db'] = undefined;
        mongoClientStub.connect.throws();
        await databaseService.connect();
        expect(mongoClientStub.connect.calledOnce).to.equal(true);
        expect(databaseService['db']).to.equal(undefined);
    });

    it('should call the database to get a collection with the correct parameters', async () => {
        const collection = 'collectionName';
        const query = { key: 'value' };
        const projection = { key: 1 };

        findCursorStub.project.returns(findCursorStub);
        findCursorStub.toArray.resolves(['test']);

        const result = await databaseService.get(collection, query, projection);

        expect(dbStub.collection.calledWith(collection)).to.equal(true);
        expect(collectionStub.find.calledWith(query)).to.equal(true);
        expect(findCursorStub.project.calledWith({ _id: 0, ...projection })).to.equal(true);
        expect(result).to.deep.equal(['test']);
    });

    it('should call the database to get a collection with the correct parameters', async () => {
        const collection = 'collectionName';

        findCursorStub.project.returns(findCursorStub);
        findCursorStub.toArray.resolves(['test']);

        const result = await databaseService.get(collection);

        expect(dbStub.collection.calledWith(collection)).to.equal(true);
        expect(collectionStub.find.calledWith({})).to.equal(true);
        expect(findCursorStub.project.calledWith({ _id: 0 })).to.equal(true);
        expect(result).to.deep.equal(['test']);
    });

    it('should call the database to get a collection with the correct parameters', async () => {
        const collection = 'collectionName';
        const query = { key: 'value' };

        findCursorStub.project.returns(findCursorStub);
        findCursorStub.toArray.resolves(['test']);

        const result = await databaseService.get(collection, query);

        expect(dbStub.collection.calledWith(collection)).to.equal(true);
        expect(collectionStub.find.calledWith(query)).to.equal(true);
        expect(findCursorStub.project.calledWith({ _id: 0 })).to.equal(true);
        expect(result).to.deep.equal(['test']);
    });

    it('should call the database to get a collection with the correct parameters', async () => {
        const collection = 'collectionName';
        const projection = { key: 1 };

        findCursorStub.project.returns(findCursorStub);
        findCursorStub.toArray.resolves(['test']);

        const result = await databaseService.get(collection, {}, projection);

        expect(dbStub.collection.calledWith(collection)).to.equal(true);
        expect(collectionStub.find.calledWith({})).to.equal(true);
        expect(findCursorStub.project.calledWith({ _id: 0, ...projection })).to.equal(true);
        expect(result).to.deep.equal(['test']);
    });

    it('should return an empty array if the database is not connected', async () => {
        databaseService['db'] = undefined;
        const result = await databaseService.get('collection', {}, {});
        expect(result).to.deep.equal([]);
    });

    it('should return an empty array if the collection is not found', async () => {
        dbStub.collection.returns(undefined);
        const result = await databaseService.get('collection', {}, {});
        expect(result).to.deep.equal([]);
    });

    it('should return an empty array if the cursor for find is not found', async () => {
        collectionStub.find.returns(undefined);
        const result = await databaseService.get('collection', {}, {});
        expect(result).to.deep.equal([]);
    });

    it('should return an empty array if the cursor for project is not found', async () => {
        findCursorStub.project.returns(undefined);
        const result = await databaseService.get('collection', {}, {});
        expect(result).to.deep.equal([]);
    });

    it('should return an empty array if the cursor for toArray is not found', async () => {
        findCursorStub.project.returns(findCursorStub);
        findCursorStub.toArray.returns(undefined);
        const result = await databaseService.get('collection', {}, {});
        expect(result).to.deep.equal([]);
    });

    it('should call the database to add a document with the correct parameters', async () => {
        const collection = 'collectionName';
        const data = { key: 'value' };

        await databaseService.add(collection, data);

        expect(collectionStub.insertOne.calledWith(data)).to.equal(true);
    });

    it('should do nothing if the database is not connected', async () => {
        databaseService['db'] = undefined;
        const collection = 'collectionName';
        const data = { key: 'value' };

        await databaseService.add(collection, data);
        expect(collectionStub.insertOne.called).to.equal(false);
    });

    it('should call the database to update a document with the correct parameters', async () => {
        const collection = 'collectionName';
        const query = { key: 'value' };
        const update = { $set: { key: 'newValue' } };

        const mockDocument = {
            _id: new ObjectId(),
            value: {
                key: 'value',
            },
        };
        collectionStub.findOneAndUpdate.resolves(mockDocument);

        const result = await databaseService.update(collection, query, update);

        expect(collectionStub.findOneAndUpdate.calledWith(query, update)).to.equal(true);
        expect(result).to.equal(true);
    });

    it('should return false if the document is not found', async () => {
        const collection = 'collectionName';
        const query = { key: 'value' };
        const update = { $set: { key: 'newValue' } };

        collectionStub.findOneAndUpdate.resolves(null);

        const result = await databaseService.update(collection, query, update);

        expect(result).to.equal(false);
    });

    it('should do nothing if the database is not connected', async () => {
        databaseService['db'] = undefined;
        const collection = 'collectionName';
        const query = { key: 'value' };
        const update = { $set: { key: 'newValue' } };

        const result = await databaseService.update(collection, query, update);
        expect(collectionStub.findOneAndUpdate.called).to.equal(false);
        expect(result).to.equal(false);
    });

    it('should call the database to delete a document with the correct parameters', async () => {
        const collection = 'collectionName';
        const query = { key: 'value' };

        collectionStub.deleteMany.resolves({ acknowledged: true, deletedCount: 1 });

        const result = await databaseService.delete(collection, query);

        expect(collectionStub.deleteMany.calledWith(query)).to.equal(true);
        expect(result).to.equal(true);
    });

    it('should return false if the document is not found', async () => {
        const collection = 'collectionName';
        const query = { key: 'value' };

        collectionStub.deleteMany.resolves({ acknowledged: true, deletedCount: 0 });

        const result = await databaseService.delete(collection, query);

        expect(result).to.equal(false);
    });

    it('should do nothing if the database is not connected', async () => {
        databaseService['db'] = undefined;
        const collection = 'collectionName';
        const query = { key: 'value' };

        const result = await databaseService.delete(collection, query);
        expect(collectionStub.deleteMany.called).to.equal(false);
        expect(result).to.equal(false);
    });
});
