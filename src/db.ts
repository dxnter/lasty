import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

export type User = {
  userID: string;
  fmUser: string;
  isSubscribedWeekly: boolean;
}

type Schema = {
  users: User[];
}

const adapter = new FileSync<Schema>('src/db.json');
const db = low(adapter);

db.defaults({ users: [] }).write();

export default db;
