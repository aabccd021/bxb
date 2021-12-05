import { Action, DeleteDocAction } from './type';
import * as A from 'fp-ts/ReadonlyArray';
import * as T from 'fp-ts/Task';
import { deleteDoc, getDocuments } from './library/firebase-admin';
import { flow, pipe } from 'fp-ts/function';

