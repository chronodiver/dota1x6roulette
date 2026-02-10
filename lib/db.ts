import { sql } from '@vercel/postgres';

export async function initDB() {
    await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      steam_id VARCHAR(20) UNIQUE NOT NULL,
      username VARCHAR(255) NOT NULL DEFAULT '',
      avatar_url TEXT NOT NULL DEFAULT '',
      rating INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

    await sql`
    CREATE TABLE IF NOT EXISTS challenges (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      difficulty VARCHAR(10) NOT NULL DEFAULT 'normal'
    );
  `;

    await sql`
    CREATE TABLE IF NOT EXISTS user_challenges (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      challenge_id INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
      status VARCHAR(10) NOT NULL DEFAULT 'active',
      rating_change INTEGER NOT NULL DEFAULT 0,
      assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMP
    );
  `;

    // Create indexes for performance
    await sql`
    CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);
  `;
    await sql`
    CREATE INDEX IF NOT EXISTS idx_user_challenges_status ON user_challenges(status);
  `;
    await sql`
    CREATE INDEX IF NOT EXISTS idx_users_rating ON users(rating DESC);
  `;
}

export { sql };
