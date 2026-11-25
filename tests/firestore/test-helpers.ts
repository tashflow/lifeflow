import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import * as fs from 'fs';

export async function setupTestEnvironment(): Promise<RulesTestEnvironment> {
  const emulatorHostEnv = process.env.FIRESTORE_EMULATOR_HOST;
  let host = '127.0.0.1';
  let port = 8080;

  if (emulatorHostEnv) {
    const [parsedHost, parsedPort] = emulatorHostEnv.split(':');
    if (parsedHost) host = parsedHost;
    if (parsedPort) port = Number(parsedPort) || 8080;
  }

  return await initializeTestEnvironment({
    projectId: 'lifeflow-stage-03c1-test',
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
      host,
      port,
    },
  });
}
