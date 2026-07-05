import { hash } from 'bcrypt';
import 'dotenv/config';

//encrypts the password using bcrypt and returns the hashed password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds =process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10;
  return hash(password, saltRounds);
}

// Compares a plain password with a hashed password and returns true if they match, false otherwise
export async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  const bcrypt = await import('bcrypt');
  return bcrypt.compare(plainPassword, hashedPassword);
}