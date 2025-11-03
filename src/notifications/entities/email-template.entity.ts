import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('email_templates')
export class EmailTemplate {
  @PrimaryColumn({ length: 50 })
  template_key: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 500, nullable: true })
  description?: string;

  @Column({ length: 200 })
  subject: string;

  @Column('text')
  html_body: string;

  @Column('text', { nullable: true })
  text_body?: string;

  @Column('json', { nullable: true })
  available_variables?: Record<string, string>; // Descripción de variables disponibles

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
