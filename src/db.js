import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

const adapter = new FileSync('src/db.json');
const db = low(adapter);

db.defaults({ users: [] }).write();

export default db;
