import { randomBytes, scryptSync } from 'node:crypto';
import readline from 'node:readline';
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
process.stdout.write('Choose an admin password (at least 12 characters; input hidden): ');
rl._writeToOutput = () => {};
rl.question('', password => {
  rl.close();
  if (password.length < 12 || password.length > 1024) { console.error('\nUse 12–1024 characters.'); process.exitCode = 1; return; }
  const salt = randomBytes(16).toString('hex');
  console.log(`\nADMIN_PASSWORD_HASH=${salt}:${scryptSync(password, salt, 64).toString('hex')}`);
  console.log(`SESSION_SECRET=${randomBytes(32).toString('hex')}`);
  console.log('Copy these into Vercel environment variables. Keep them private.');
});
