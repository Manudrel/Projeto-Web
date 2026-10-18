import { BadRequestException, ConflictException, Injectable, NotFoundException, } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository.js';
import { CategoryStatus } from './category.entity.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { ListCategoriesDto } from './dto/list-categories.dto.js';

@Injectable()
export class CategoriesService {

  constructor(private readonly categoriesRepository: CategoriesRepository) { }

  findAll(filters: ListCategoriesDto) {
    return this.categoriesRepository.findAll(filters);
  }

  async findById(id: number) {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async create(data: CreateCategoryDto) {
    const categoryWithSameName = await this.categoriesRepository.findByName(data.name,);

    if (categoryWithSameName) {
      throw new ConflictException('Já existe uma categoria com esse nome');
    }

    return this.categoriesRepository.create(data);

  }

  async update(id: number, data: UpdateCategoryDto) {

    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    if (data.name !== undefined && data.name !== category.name) {
      const categoryWithSameName = await this.categoriesRepository.findByName(data.name, id,);

      if (categoryWithSameName) {
        throw new ConflictException('Já existe uma categoria com esse nome');
      }
    }

    if (data.status === CategoryStatus.INACTIVE) {
      await this.ensureWithoutPublishedCourses(id, 'Não é possível inativar uma categoria com cursos publicados',);
    }

    return this.categoriesRepository.update(id, data);
  }

  async delete(id: number) {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    await this.ensureWithoutPublishedCourses(id, 'Não é possível excluir uma categoria com cursos publicados',);
    await this.categoriesRepository.delete(id);
  }

  private async ensureWithoutPublishedCourses(id: number, message: string) {
    const publishedCourse = await this.categoriesRepository.findPublishedCourseByCategory(id);

    if (publishedCourse) {
      throw new BadRequestException(message);
    }
  }
}
