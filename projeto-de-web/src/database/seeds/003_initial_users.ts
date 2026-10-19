import bcrypt from 'bcrypt';
import type { Knex } from 'knex';

interface ProfileSeed {
  id: number;
  role: string;
}

export async function seed(knex: Knex): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set before running the user seed.',
    );
  }

  const profiles = (await knex('profiles').select('id', 'role')) as ProfileSeed[];
  const adminProfile = profiles.find((profile) => profile.role === 'ADMIN');
  const instructorProfile = profiles.find(
    (profile) => profile.role === 'INSTRUCTOR',
  );
  const studentProfile = profiles.find((profile) => profile.role === 'STUDENT');

  if (!adminProfile) {
    throw new Error(
      'ADMIN profile was not found. Run the 001_auth_base seed first.',
    );
  }

  if (!instructorProfile || !studentProfile) {
    throw new Error(
      'INSTRUCTOR and STUDENT profiles were not found. Run the 001_auth_base seed first.',
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const users = [
    {
      name: 'Platform Admin',
      email,
      password_hash: passwordHash,
      status: 'ACTIVE',
      profile_id: adminProfile.id,
    },
    ...Array.from({ length: 3 }, (_, index) => ({
      name: `Test Instructor ${String(index + 1).padStart(2, '0')}`,
      email: `instructor${String(index + 1).padStart(2, '0')}@example.com`,
      password_hash: passwordHash,
      status: index === 1 ? 'INACTIVE' : 'ACTIVE',
      profile_id: instructorProfile.id,
    })),
    ...Array.from({ length: 6 }, (_, index) => ({
      name: `Test Student ${String(index + 1).padStart(2, '0')}`,
      email: `student${String(index + 1).padStart(2, '0')}@example.com`,
      password_hash: passwordHash,
      status: index === 2 ? 'INACTIVE' : 'ACTIVE',
      profile_id: studentProfile.id,
    })),
    {
      name: 'Student Context Demo',
      email: 'student.context@example.com',
      password_hash: passwordHash,
      status: 'ACTIVE',
      profile_id: studentProfile.id,
    },
  ];

  const [adminUser, ...demoUsers] = users;
  const existingSeedAdmin = await knex('users')
    .where({ name: 'Platform Admin', profile_id: adminProfile.id })
    .orderBy('id')
    .first('id');

  if (existingSeedAdmin) {
    await knex('users')
      .where('id', existingSeedAdmin.id)
      .update({
        ...adminUser,
        deleted_at: null,
        updated_at: knex.fn.now(),
      });
  } else {
    await knex('users')
      .insert(adminUser)
      .onConflict('email')
      .merge(['name', 'password_hash', 'status', 'profile_id', 'deleted_at']);
  }

  await knex('users')
    .insert(demoUsers)
    .onConflict('email')
    .merge(['name', 'password_hash', 'status', 'profile_id', 'deleted_at']);
}
