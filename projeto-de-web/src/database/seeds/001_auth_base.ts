import type { Knex } from 'knex';

interface ProfileSeed {
  id: number;
  role: string;
}

interface PermissionSeed {
  id: number;
  name: string;
}

const actionsByResource: Record<string, string[]> = {
  USERS: ['create', 'read', 'update', 'delete', 'status', 'password'],
  PROFILES: ['create', 'read', 'update', 'delete'],
  PERMISSIONS: ['create', 'read', 'update', 'delete'],
  CATEGORIES: ['create', 'read', 'update', 'delete'],
  COURSES: ['create', 'read', 'update', 'delete', 'publish', 'unpublish'],
  MODULES: ['create', 'read', 'update', 'delete'],
  LESSONS: ['create', 'read', 'update', 'delete'],
  ENROLLMENTS: ['create', 'read', 'cancel'],
  PROGRESS: ['create', 'read', 'update'],
  ASSESSMENTS: ['create', 'read', 'update', 'delete', 'attempt'],
  CERTIFICATES: ['read', 'create', 'revoke', 'verify'],
};

const permissionsByRole: Record<string, string[]> = {
  ADMIN: ['*'],
  INSTRUCTOR: [
    'categories:read',
    'courses:create',
    'courses:read',
    'courses:update',
    'courses:delete',
    'courses:publish',
    'courses:unpublish',
    'modules:create',
    'modules:read',
    'modules:update',
    'modules:delete',
    'lessons:create',
    'lessons:read',
    'lessons:update',
    'lessons:delete',
    'enrollments:read',
    'progress:read',
    'assessments:create',
    'assessments:read',
    'assessments:update',
    'assessments:delete',
  ],
  STUDENT: [
    'categories:read',
    'courses:read',
    'modules:read',
    'lessons:read',
    'enrollments:create',
    'enrollments:read',
    'enrollments:cancel',
    'progress:create',
    'progress:read',
    'progress:update',
    'assessments:read',
    'assessments:attempt',
    'certificates:read',
    'certificates:verify',
  ],
};

export async function seed(knex: Knex): Promise<void> {
  const profiles = [
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
  ];

  await knex('profiles')
    .insert(profiles)
    .onConflict('role')
    .merge(['name', 'description', 'status']);

  const permissionRows = Object.entries(actionsByResource).flatMap(
    ([resource, actions]) =>
      actions.map((action) => ({
        name: `${resource.toLowerCase()}:${action}`,
        resource,
        description: `${action} ${resource.toLowerCase()}`,
      })),
  );
  await knex('permissions')
    .insert(permissionRows)
    .onConflict('name')
    .merge(['resource', 'description']);

  const profileRows = (await knex('profiles').select(
    'id',
    'role',
  )) as ProfileSeed[];
  const permissionRecords = (await knex('permissions').select(
    'id',
    'name',
  )) as PermissionSeed[];

  for (const profile of profileRows) {
    const allowed = permissionsByRole[profile.role] ?? [];
    const permissionIds = permissionRecords
      .filter(
        (permission) =>
          allowed.includes('*') || allowed.includes(permission.name),
      )
      .map((permission) => permission.id);

    await knex('profile_permissions').where('profile_id', profile.id).delete();
    if (permissionIds.length > 0) {
      await knex('profile_permissions').insert(
        permissionIds.map((permissionId) => ({
          profile_id: profile.id,
          permission_id: permissionId,
        })),
      );
    }
  }
}
