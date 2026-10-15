import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { CategoryStatus } from './category.entity.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoriesRepository {
  constructor(@Inject('KNEX') private readonly db: Knex) { }

  findById(id: number) {
    return this.db('categories').where('id', id).whereNull('deletedAt').first();
  }

  findByName(name: string, ignoreCategoryId?: number) {
    const query = this.db('categories')
      .whereRaw('LOWER(name) = LOWER(?)', [name])
      .whereNull('deletedAt');

    if (ignoreCategoryId) query.whereNot('id', ignoreCategoryId);

    return query.first();
  }

  findPublishedCourseByCategory(categoryId: number) {
    return this.db('courses')
      .where('categoryId', categoryId)
      .where('isPublished', true)
      .whereNull('deletedAt')
      .first();
  }

  async create(data: CreateCategoryDto) {
    const [category] = await this.db('categories')
      .insert({
        name: data.name,
        description: data.description,
        status: CategoryStatus.ACTIVE,
      })
      .returning('*');

    return category;
  }

  async update(id: number, data: UpdateCategoryDto) {
    const [category] = await this.db('categories')
      .where('id', id)
      .update({
        name: data.name,
        description: data.description,
        status: data.status,
        updatedAt: this.db.fn.now(),
      })
      .returning('*');

    return category;
  }

  async delete(id: number) {
    await this.db('categories')
      .where('id', id)
      .update({ deletedAt: this.db.fn.now() });
  }
}
