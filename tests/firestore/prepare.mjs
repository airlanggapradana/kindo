import { copyFile } from 'node:fs/promises';

// Firebase CLI requires its rules file to stay inside the fixture project.
await copyFile(new URL('../../firestore.rules', import.meta.url), new URL('.firestore.rules', import.meta.url));
