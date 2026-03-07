/**
 * PostgreSQL adapter example - swap in db/index.js for migration
 * Replace firestoreAdapter with this when migrating to Postgres.
 *
 * const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 *
 * export const postgresUserAdapter = {
 *   async getById(userId) {
 *     const r = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
 *     return r.rows[0] || null;
 *   },
 *   async create(userId, data) {
 *     await pool.query(
 *       'INSERT INTO users (id, email, display_name, ...) VALUES ($1, $2, $3, ...)',
 *       [userId, data.email, data.displayName, ...]
 *     );
 *   },
 *   async update(userId, data) { ... },
 *   async exists(userId) { ... },
 * };
 */
