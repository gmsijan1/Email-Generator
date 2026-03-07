/**
 * Data Access Layer (DAL) Interfaces
 * Define contracts for database operations. Swap implementations (Firestore, PostgreSQL, etc.)
 * by changing the adapter in index.js without touching controllers or routes.
 */

/**
 * User document shape (database-agnostic)
 */
export const UserShape = {
  id: "",
  email: "",
  displayName: "",
  authProvider: "",
  companyName: "",
  senderNameTitle: "",
  productService: "",
  keyDifferentiator: "",
  socialProofClient: "",
  socialProofResult: "",
  line3Input: "",
  createdAt: "",
  updatedAt: "",
};

/**
 * User DAL interface
 * @typedef {Object} UserDAL
 * @property {function(string): Promise<Object|null>} getById - Get user by ID
 * @property {function(string, Object): Promise<void>} create - Create user
 * @property {function(string, Object): Promise<void>} update - Update user (merge)
 * @property {function(string): Promise<boolean>} exists - Check if user exists
 */
