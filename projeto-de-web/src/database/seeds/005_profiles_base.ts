import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {

  await knex('profiles').del();

  await knex('profiles').insert([
    {
      name: 'Administrator',
      role: 'ADMIN',
      description: 'Full platform access',
      status: 'ACTIVE',
    },
    {
      name: 'Instructor',
      role: 'INSTRUCTOR',
      description: 'Manages owned courses',
      status: 'ACTIVE',
    },
    {
      name: 'Student',
      role: 'STUDENT',
      description: 'Learns and tracks course progress',
      status: 'ACTIVE',
    },
  ]);
}
