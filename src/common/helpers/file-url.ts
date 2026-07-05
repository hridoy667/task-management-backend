export function generateAvatarUrl(filename: string): string {
  const baseUrl = process.env.BACKEND_URL || 'http://localhost:9000';

  return `${baseUrl}/public/avatars/${filename}`;
}