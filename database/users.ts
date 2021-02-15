import { readFileSync, writeFileSync, existsSync } from 'fs';
import { writeFile } from 'fs/promises';


export type UserObj = { [key: string]: 'code'|'nocode' };

if (!existsSync('./users.json')) {
  writeFileSync('./users.json', JSON.stringify({}));
}

export const USERS: UserObj =
  existsSync('./users.json')
    ? JSON.parse(readFileSync('./users.json', 'utf-8'))
    : {}
;


export function addUser(userid: string) {
  USERS[userid] = 'nocode';
  saveUsers();
}


export function updateUser(user: string, val: 'code'|'nocode') {
  USERS[user] = val;
  saveUsers();
}


export function getUserState(userid: string): "code" | "nocode" | undefined {
  return USERS[userid];
}


let fileQueue = -1
;
export function saveUsers() {
  ++fileQueue;
  setTimeout(async () => {
    await writeFile('./users.json', JSON.stringify(USERS));
    --fileQueue;
  }, fileQueue * 250);
}