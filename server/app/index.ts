// WARNING : Make sure to always import 'reflect-metadata' and 'module-alias/register' first
import 'module-alias/register';
import 'reflect-metadata';
// eslint-disable-next-line import/first
import { Server } from '@app/server';
import { Container } from 'typedi';
import { DatabaseService } from './services/database.service';

const server: Server = Container.get(Server);
server.init();

const databaseService: DatabaseService = Container.get(DatabaseService);
databaseService.connect();
