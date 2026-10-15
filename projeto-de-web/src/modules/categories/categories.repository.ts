import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { CategoryStatus } from './category.entity.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

const categoryColumns = [
  'id',
  'name',
  'description',
  'status',
  'created_at as createdAt',
  'updated_at as updatedAt',
  'deleted_at as deletedAt',
];

@Injectable()
export class CategoriesRepository {
  constructor(@Inject('KNEX') private readonly db: Knex) { }

  findById(id: number) {
    return this.db('categories')
      .where('id', id)
      .whereNull('deleted_at')
      .select(categoryColumns)
      .first();
  }

  findByName(name: string, ignoreCategoryId?: number) {
    const query = this.db('categories')
      .whereRaw('LOWER(name) = LOWER(?)', [name])
      .whereNull('deleted_at')
      .select(categoryColumns);

    if (ignoreCategoryId) query.whereNot('id', ignoreCategoryId);

    return query.first();
  }

  findPublishedCourseByCategory(categoryId: number) {
    return this.db('courses')
      .where('category_id', categoryId)
      .where('is_published', true)
      .whereNull('deleted_at')
      .first();
  }

  async create(data: CreateCategoryDto) {
    const [category] = await this.db('categories')
      .insert({
        name: data.name,
        description: data.description,
        status: CategoryStatus.ACTIVE,
      })
      .returning(categoryColumns);

    return category;
  }

  async update(id: number, data: UpdateCategoryDto) {
    const [category] = await this.db('categories')
      .where('id', id)
      .update({
        name: data.name,
        description: data.description,
        status: data.status,
        updated_at: this.db.fn.now(),
      })
      .returning(categoryColumns);

    return category;
  }

  async delete(id: number) {
    await this.db('categories')
      .where('id', id)
      .update({ deleted_at: this.db.fn.now() });
  }
}
