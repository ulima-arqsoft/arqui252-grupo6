// apps/backend/users-service/src/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  specialty: string; // Ej: Full Stack Developer

  // Profile Info
  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column('simple-array', { nullable: true })
  skills: string[];

  @Column('simple-array', { nullable: true })
  interests: string[];

  @Column({ nullable: true })
  avatar: string; // Initials or URL

  // Stats
  @Column({ type: 'float', default: 0 })
  rating: number;

  @Column({ default: 0 })
  projectsCreated: number;

  @Column({ default: 0 })
  projectsCollaborated: number;

  @Column({ type: 'float', default: 0 })
  totalEarnings: number;

  @Column('simple-array', { nullable: true })
  portfolioLinks: string[];

  // Authentication (basic)
  @Column({ nullable: true })
  passwordHash: string;
}