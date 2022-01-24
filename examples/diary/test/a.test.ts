import { initializeApp } from "firebase/app";
import { collection, connectFirestoreEmulator, doc, getDoc, getFirestore, setDoc } from 'firebase/firestore/lite';



describe('Fields', () => {
  it('has type property', async () => {
		const app = initializeApp({projectId: 'demo-diary'});
		const db = getFirestore(app);
		connectFirestoreEmulator(db, 'localhost', 8080);
		const coll = collection(db, 'coll');
		const docRef = doc(coll, 'idd')
		await setDoc(docRef, {a: 'b'});
		const res = await getDoc(docRef);
		expect(res.data()).toStrictEqual({a: 'b'});
		expect(res.data()).toStrictEqual({});
  });
});