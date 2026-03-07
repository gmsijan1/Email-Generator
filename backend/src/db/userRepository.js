/**
 * User Repository - Uses DAL adapter (no Firebase imports)
 * Controllers call this; adapter is injected at startup.
 */

let userAdapter = null;

export function setUserAdapter(adapter) {
  userAdapter = adapter;
}

export function getUserAdapter() {
  if (!userAdapter) throw new Error("User DAL adapter not set");
  return userAdapter;
}

export async function getUserById(userId) {
  return getUserAdapter().getById(userId);
}

export async function createUser(userId, data) {
  return getUserAdapter().create(userId, data);
}

export async function updateUser(userId, data) {
  return getUserAdapter().update(userId, data);
}

export async function userExists(userId) {
  return getUserAdapter().exists(userId);
}
