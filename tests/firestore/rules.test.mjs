import { before, beforeEach, after, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, or, and, getDocs, serverTimestamp, orderBy } from 'firebase/firestore';

let environment;
const db = uid => environment.authenticatedContext(uid).firestore();
const user = (uid, role, extra = {}) => ({ uid, role, name: uid, email: `${uid}@test.invalid`, ...extra });
before(async () => {
  const [host, port] = (process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:18095').split(':');
  environment = await initializeTestEnvironment({ projectId: 'demo-kindo', firestore: { host, port: Number(port), rules: await readFile(new URL('../../firestore.rules', import.meta.url), 'utf8') } });
});
beforeEach(async () => {
  await environment.clearFirestore();
  await environment.withSecurityRulesDisabled(async context => {
    const store = context.firestore();
    const fixtures = {
      'users/parent1': user('parent1','orang_tua',{ assignedNakesId:'nakes1' }),
      'users/parent2': user('parent2','orang_tua',{ assignedNakesId:'nakes2' }),
      'users/unassigned': user('unassigned','orang_tua'),
      'users/nakes1': user('nakes1','nakes',{ isVerified:true }),
      'users/nakes2': user('nakes2','nakes',{ isVerified:true }),
      'users/pending': user('pending','nakes',{ isVerified:false }),
      'users/admin': user('admin','admin'),
      'childProfiles/child1': { userId:'parent1',name:'Test Child',ageInMonths:12,heightCm:70,weightKg:8,gender:'Perempuan',updatedAt:new Date() },
      'childProfiles/child2': { userId:'parent2',name:'Other Child',ageInMonths:12,heightCm:70,weightKg:8,gender:'Perempuan',updatedAt:new Date() },
      'questionnaireResults/result1': { userId:'parent1',profileId:'child1',ageCategory:'3_bulan',answers:{},totalScore:9,createdAt:new Date() },
      'messages/message1': { chatId:'nakes1_parent1',senderId:'parent1',receiverId:'nakes1',text:'Test message',read:false,createdAt:new Date() },
    };
    await Promise.all(Object.entries(fixtures).map(([path,value]) => setDoc(doc(store,path),value)));
  });
});
after(async () => { await environment?.cleanup(); });

test('anonymous cannot read health records', () => assertFails(getDoc(doc(environment.unauthenticatedContext().firestore(),'childProfiles/child1'))));
test('parent can read own child', () => assertSucceeds(getDoc(doc(db('parent1'),'childProfiles/child1'))));
test('parent cannot read another child', () => assertFails(getDoc(doc(db('parent2'),'childProfiles/child1'))));
test('assigned verified nakes can read child and screening', async () => { await assertSucceeds(getDoc(doc(db('nakes1'),'childProfiles/child1'))); await assertSucceeds(getDoc(doc(db('nakes1'),'questionnaireResults/result1'))); });
test('unassigned verified nakes cannot read child', () => assertFails(getDoc(doc(db('nakes2'),'childProfiles/child1'))));
test('clinician child query must be limited to assigned parent IDs', async () => { await assertSucceeds(getDocs(query(collection(db('nakes1'),'childProfiles'),where('userId','in',['parent1'])))); await assertFails(getDocs(collection(db('nakes1'),'childProfiles'))); });
test('unverified nakes cannot read child', () => assertFails(getDoc(doc(db('pending'),'childProfiles/child1'))));
test('administrator can list health records', () => assertSucceeds(getDocs(collection(db('admin'),'childProfiles'))));
test('owner cannot escalate role or verification', async () => { await assertFails(updateDoc(doc(db('parent1'),'users/parent1'),{role:'admin'})); await assertFails(updateDoc(doc(db('pending'),'users/pending'),{isVerified:true})); });
test('owner cannot change UID or assign a clinician unilaterally', async () => { await assertFails(updateDoc(doc(db('parent1'),'users/parent1'),{uid:'admin'})); await assertFails(updateDoc(doc(db('parent1'),'users/parent1'),{assignedNakesId:'nakes2'})); });
test('new user can create parent profile but not administrator', async () => { await assertSucceeds(setDoc(doc(db('newparent'),'users/newparent'),user('newparent','orang_tua'))); await assertFails(setDoc(doc(db('newadmin'),'users/newadmin'),user('newadmin','admin'))); });
test('new nakes cannot self-verify', () => assertFails(setDoc(doc(db('newnakes'),'users/newnakes'),user('newnakes','nakes',{isVerified:true}))));
test('owner can update own presence but not another user presence', async () => { await assertSucceeds(updateDoc(doc(db('parent1'),'users/parent1'),{isOnline:true,lastActive:serverTimestamp()})); await assertFails(updateDoc(doc(db('parent1'),'users/parent2'),{isOnline:true})); });
test('verified clinician can claim an unassigned parent once', async () => { await assertSucceeds(updateDoc(doc(db('nakes1'),'users/unassigned'),{assignedNakesId:'nakes1'})); await assertFails(updateDoc(doc(db('nakes2'),'users/unassigned'),{assignedNakesId:'nakes2'})); });
test('pending nakes cannot claim parent', () => assertFails(updateDoc(doc(db('pending'),'users/unassigned'),{assignedNakesId:'pending'})));
test('parent cannot read other parent profile', () => assertFails(getDoc(doc(db('parent1'),'users/parent2'))));
test('clinician can list parent metadata but not other clinicians health records', () => assertSucceeds(getDocs(query(collection(db('nakes1'),'users'),where('role','==','orang_tua')))));
test('only participants can read a message', async () => { await assertSucceeds(getDoc(doc(db('parent1'),'messages/message1'))); await assertFails(getDoc(doc(db('parent2'),'messages/message1'))); });
test('chat query constrained to participant is permitted', () => assertSucceeds(getDocs(query(collection(db('parent1'),'messages'),and(where('chatId','==','nakes1_parent1'),or(where('senderId','==','parent1'),where('receiverId','==','parent1'))),orderBy('createdAt','asc')))));
test('messages cannot forge sender or contact unassigned clinician', async () => {
  const data={chatId:'nakes1_parent1',senderId:'parent1',receiverId:'nakes1',text:'hello',createdAt:serverTimestamp(),read:false};
  await assertSucceeds(setDoc(doc(db('parent1'),'messages/new1'),data));
  await assertFails(setDoc(doc(db('parent2'),'messages/new2'),data));
  await assertFails(setDoc(doc(db('parent2'),'messages/new3'),{...data,senderId:'parent2',chatId:'nakes1_parent2'}));
});
test('only receiver can mark a message read; text is immutable', async () => { await assertFails(updateDoc(doc(db('parent1'),'messages/message1'),{read:true})); await assertSucceeds(updateDoc(doc(db('nakes1'),'messages/message1'),{read:true})); await assertFails(updateDoc(doc(db('nakes1'),'messages/message1'),{text:'changed'})); });
test('parent can save result only for own child', async () => {
  const data={userId:'parent1',profileId:'child1',ageCategory:'3_bulan',answers:Object.fromEntries(Array.from({length:10},(_,i)=>[`q_3_${i+1}`,1])),totalScore:10,createdAt:serverTimestamp()};
  await assertSucceeds(setDoc(doc(db('parent1'),'questionnaireResults/new1'),data));
  await assertFails(setDoc(doc(db('parent1'),'questionnaireResults/new2'),{...data,profileId:'child2'}));
});
test('clinician cannot overwrite patient measurements', () => assertFails(updateDoc(doc(db('nakes1'),'childProfiles/child1'),{weightKg:50,updatedAt:serverTimestamp()})));
