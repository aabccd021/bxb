import { EventContext, firestore } from 'firebase-functions';
import { DocumentBuilder, QueryDocumentSnapshot } from 'firebase-functions/v1/firestore';

export const _document = (path: string) => firestore.document(path);


export const _onCreate = 
	(handler: (snapshot: QueryDocumentSnapshot) =>  (context: EventContext) => Promise<any>) => 
	(builder: DocumentBuilder) => 
		builder.onCreate((snapshot, context) => handler(snapshot)(context));