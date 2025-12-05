// apps/backend/ideas-service/src/idea.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type IdeaDocument = HydratedDocument<Idea>;

@Schema({ timestamps: true })
export class Idea {
  // Basic Info
  @Prop({ required: true, index: true }) title: string;
  @Prop({ required: true }) description: string;
  @Prop() fullDescription: string;

  // Categorization & Search
  @Prop({ index: true }) category: string;
  @Prop({ type: [String], index: true }) tags: string[];
  @Prop({ type: [String], index: true }) skills: string[];

  // Financial
  @Prop({ required: true }) budget: string;

  // Author Info
  @Prop({ required: true }) author: string;
  @Prop({ required: true }) authorId: string;
  @Prop() avatar: string;
  @Prop({ default: 0 }) authorRating: number;

  // Project Status
  @Prop({
    default: 'Nueva',
    enum: ['Nueva', 'Activa', 'En Pausa', 'Finalizada'],
    index: true
  }) status: string;

  // Collaboration
  @Prop({ default: 0 }) collaborators: number;
  @Prop({ type: [String], default: [] }) collaborationRequests: string[]; // Array of user IDs
  @Prop({ type: [String], default: [] }) acceptedCollaborators: string[]; // Array of user IDs

  // Timeline
  @Prop() deliveryTime: string;
  @Prop() revisions: string;

  // Media & Portfolio
  @Prop({ type: [String], default: [] }) portfolio: string[];

  // Files
  @Prop({ type: [{ name: String, type: String, size: Number, uri: String }], default: [] })
  files: { name: string; type: string; size: number; uri?: string }[];

  // Visibility
  @Prop({
    default: 'public',
    enum: ['public', 'private', 'shared']
  }) visibility: string;
  @Prop({ type: [String], default: [] }) sharedWith: string[]; // User IDs for 'shared' visibility

  // Draft mode
  @Prop({ default: false }) isDraft: boolean;
}

export const IdeaSchema = SchemaFactory.createForClass(Idea);

// Create text index for search
IdeaSchema.index({ title: 'text', description: 'text', fullDescription: 'text' });