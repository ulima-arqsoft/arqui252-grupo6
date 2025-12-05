import { Injectable, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchService implements OnModuleInit {
    constructor(private readonly elasticsearchService: ElasticsearchService) { }

    async onModuleInit() {
        try {
            // Check if index exists
            const indexExists = await this.elasticsearchService.indices.exists({
                index: 'ideas',
            } as any);

            if (!indexExists) {
                console.log('📊 Creating Elasticsearch index: ideas');
                await this.elasticsearchService.indices.create({
                    index: 'ideas',
                    body: {
                        mappings: {
                            properties: {
                                id: { type: 'keyword' },
                                title: { type: 'text' },
                                description: { type: 'text' },
                                category: { type: 'keyword' },
                                tags: { type: 'keyword' },
                                skills: { type: 'keyword' },
                                status: { type: 'keyword' },
                                visibility: { type: 'keyword' },
                                authorId: { type: 'keyword' },
                                createdAt: { type: 'date' },
                            },
                        },
                    },
                } as any);
                console.log('✅ Elasticsearch index created successfully');
            } else {
                console.log('✅ Elasticsearch index already exists');
            }
        } catch (error) {
            console.warn('⚠️ Elasticsearch index creation failed (non-critical):', error.message);
        }
    }

    async indexIdea(idea: any): Promise<any> {
        try {
            return await this.elasticsearchService.index({
                index: 'ideas',
                id: idea._id?.toString(),
                body: {
                    id: idea._id,
                    title: idea.title,
                    description: idea.description,
                    category: idea.category,
                    tags: idea.tags,
                    skills: idea.skills,
                    status: idea.status,
                    visibility: idea.visibility,
                    authorId: idea.authorId,
                    createdAt: idea.createdAt,
                    files: idea.files,
                },
            } as any) as any;
        } catch (error) {
            console.warn('⚠️ Elasticsearch indexing failed:', error.message);
            throw error;
        }
    }

    async search(text: string): Promise<any[]> {
        try {
            const { body } = await this.elasticsearchService.search({
                index: 'ideas',
                body: {
                    query: {
                        multi_match: {
                            query: text,
                            fields: ['title^2', 'description', 'tags', 'skills', 'category'],
                            fuzziness: 'AUTO',
                        },
                    },
                },
            } as any) as any;
            const hits = body.hits.hits;
            return hits.map((item: any) => item._source);
        } catch (error) {
            console.warn('⚠️ Elasticsearch search failed:', error.message);
            return [];
        }
    }

    async delete(id: string): Promise<any> {
        try {
            return await this.elasticsearchService.deleteByQuery({
                index: 'ideas',
                body: {
                    query: {
                        match: {
                            id: id,
                        },
                    },
                },
            } as any) as any;
        } catch (error) {
            console.warn('⚠️ Elasticsearch delete failed:', error.message);
            throw error;
        }
    }
}
