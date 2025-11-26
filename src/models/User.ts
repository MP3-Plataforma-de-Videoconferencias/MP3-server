/**
 * Interface that represents a User object inside the application.
 *
 * This model centralizes all the information related to a user:
 * - Basic personal data (first name, last name, age)
 * - Login credentials (email and password)
 * - Timestamps for creation and updates
 *
 * This interface is mainly used for:
 * - User registration
 * - Storing and validating user information
 * - Managing user data inside the database
 */
export interface User {

  /** 
   * Optional unique identifier for the user.
   * Usually assigned automatically by the database.
   */
  id?: string;

  /**
   * User's first name.
   * Provided when the user registers.
   */
  firstName: string;

  /**
   * User's last name.
   * Provided when the user registers.
   */
  lastName: string;

  /**
   * User's age.
   * Stored as a number.
   */
  age: number;

  /**
   * User's email address.
   * Must be unique in the system.
   */
  email: string;

  /**
   * User's password.
   * Received in plain text and should be encrypted before saving.
   */
  password: string;

  /**
   * Timestamp of when the user was created.
   * Automatically assigned by the system.
   */
  createdAt?: Date;

  /**
   * Timestamp of the last update of the user.
   * Automatically updated by the system.
   */
  updatedAt?: Date;
}
