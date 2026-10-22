import { randomBytes } from 'node:crypto';
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
      'SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD devem ser definidos antes de executar o seed de usuários.',
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
      'Perfil de ADMIN não encontrado. Execute o seed 001_auth_base primeiro.',
    );
  }

  if (!instructorProfile || !studentProfile) {
    throw new Error(
      'Perfis de INSTRUCTOR e STUDENT não encontrados. Execute o seed 001_auth_base primeiro.',
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const passwordHash1 = await bcrypt.hash(
    randomBytes(24).toString('base64url'),
    12,
  );
  const passwordHash2 = await bcrypt.hash(
    randomBytes(24).toString('base64url'),
    12,
  );
  const passwordHash3 = await bcrypt.hash(
    randomBytes(24).toString('base64url'),
    12,
  );
  const passwordHash4 = await bcrypt.hash(
    randomBytes(24).toString('base64url'),
    12,
  );
  const users = [
    {
      name: 'Carlinhos Admin',
      email,
      password_hash: passwordHash,
      status: 'ACTIVE',
      profile_id: adminProfile.id,
    },
    {
      name: 'Carlinhos Instrutor',
      email: 'carlinhosinstrutor@example.com',
      password_hash: passwordHash,
      status: 'ACTIVE',
      profile_id: instructorProfile.id,
    },
    {
      name: 'Carlinhos Estudante',
      email: 'carlinhosestudante@example.com',
      password_hash: passwordHash,
      status: 'ACTIVE',
      profile_id: studentProfile.id,
    },
    {
      name: 'Estudante Exemplo 02',
      email: 'student02@example.com',
      password_hash: passwordHash1,
      status: 'ACTIVE',
      profile_id: studentProfile.id,
    },
    {
      name: 'Estudante Exemplo 03',
      email: 'student03@example.com',
      password_hash: passwordHash2,
      status: 'ACTIVE',
      profile_id: studentProfile.id,
    },
    {
      name: 'Estudante Exemplo 04',
      email: 'student04@example.com',
      password_hash: passwordHash3,
      status: 'ACTIVE',
      profile_id: studentProfile.id,
    },
    {
      name: 'Estudante Exemplo 05',
      email: 'student05@example.com',
      password_hash: passwordHash4,
      status: 'ACTIVE',
      profile_id: studentProfile.id,
    },
  ];

  const [adminUser] = users;
  const existingSeedAdmin = await knex('users')
    .where({ email, profile_id: adminProfile.id })
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
      .onConflict(knex.raw('(LOWER(email)) WHERE deleted_at IS NULL'))
      .merge(['name', 'password_hash', 'status', 'profile_id', 'deleted_at']);
  }

  await knex('users')
    .insert(users)
    .onConflict()
    .ignore();
}
