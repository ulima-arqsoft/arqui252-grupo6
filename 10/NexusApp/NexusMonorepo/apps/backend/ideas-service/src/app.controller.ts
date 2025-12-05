// apps/backend/ideas-service/src/app.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Idea } from './idea.schema';
import { SearchService } from './search/search.service';

@Controller()
export class AppController {
  constructor(
    @InjectModel(Idea.name) private ideaModel: Model<Idea>,
    private readonly searchService: SearchService
  ) { }

  @MessagePattern({ cmd: 'create_idea' })
  async create(@Payload() data: any) {
    const createdIdea = new this.ideaModel(data);
    const savedIdea = await createdIdea.save();
    try {
      await this.searchService.indexIdea(savedIdea);
    } catch (error) {
      console.warn('⚠️ Elasticsearch indexing failed (non-critical):', error.message);
    }
    return savedIdea;
  }

  @MessagePattern({ cmd: 'get_ideas' })
  async findAll() {
    return this.ideaModel.find({ isDraft: false, visibility: 'public' }).exec();
  }

  @MessagePattern({ cmd: 'get_idea_by_id' })
  async findOne(@Payload() id: string) {
    return this.ideaModel.findById(id).exec();
  }

  @MessagePattern({ cmd: 'search_ideas' })
  async search(@Payload() filters: any) {
    if (filters.keyword) {
      return this.searchService.search(filters.keyword);
    }

    const query: any = { isDraft: false };

    // Category filter
    if (filters.category) {
      query.category = filters.category;
    }

    // Tags filter (match any)
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    // Skills filter (match any)
    if (filters.skills && filters.skills.length > 0) {
      query.skills = { $in: filters.skills };
    }

    // Status filter
    if (filters.status) {
      query.status = filters.status;
    }

    // Visibility filter (default to public only)
    if (filters.userId) {
      query.$or = [
        { visibility: 'public' },
        { visibility: 'shared', sharedWith: filters.userId },
        { authorId: filters.userId }
      ];
    } else {
      query.visibility = 'public';
    }

    // Build sort
    let sort: any = {};
    if (filters.sortBy === 'date') {
      sort.createdAt = -1;
    } else if (filters.sortBy === 'popularity') {
      sort.collaborators = -1;
    }

    return this.ideaModel.find(query).sort(sort).exec();
  }

  @MessagePattern({ cmd: 'update_idea' })
  async update(@Payload() data: { id: string; updates: any }) {
    const updatedIdea = await this.ideaModel.findByIdAndUpdate(data.id, data.updates, { new: true }).exec();
    if (updatedIdea) {
      await this.searchService.indexIdea(updatedIdea);
    }
    return updatedIdea;
  }

  @MessagePattern({ cmd: 'delete_idea' })
  async delete(@Payload() id: string) {
    await this.searchService.delete(id);
    return this.ideaModel.findByIdAndDelete(id).exec();
  }

  @MessagePattern({ cmd: 'request_collaboration' })
  async requestCollaboration(@Payload() data: { ideaId: string; userId: string }) {
    const idea = await this.ideaModel.findById(data.ideaId);
    if (!idea) return { success: false, message: 'Idea not found' };

    if (idea.collaborationRequests.includes(data.userId)) {
      return { success: false, message: 'Request already sent' };
    }

    idea.collaborationRequests.push(data.userId);
    idea.collaborators = (idea.collaborators || 0) + 1;
    await idea.save();

    return { success: true, message: 'Collaboration request sent' };
  }

  @MessagePattern({ cmd: 'manage_collaboration' })
  async manageCollaboration(@Payload() data: { ideaId: string; userId: string; action: 'accept' | 'reject' }) {
    const idea = await this.ideaModel.findById(data.ideaId);
    if (!idea) return { success: false, message: 'Idea not found' };

    if (data.action === 'accept') {
      idea.acceptedCollaborators.push(data.userId);
      idea.collaborationRequests = idea.collaborationRequests.filter(id => id !== data.userId);
      await idea.save();
      return { success: true, message: 'Collaborator accepted' };
    } else {
      idea.collaborationRequests = idea.collaborationRequests.filter(id => id !== data.userId);
      idea.collaborators = Math.max(0, (idea.collaborators || 0) - 1);
      await idea.save();
      return { success: true, message: 'Request rejected' };
    }
  }
}