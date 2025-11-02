import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('email_templates')
export class EmailTemplates {
  @PrimaryGeneratedColumn()
  template_id: number;

  @Column({ unique: true })
  template_key: string; // e.g., 'advisory_request_new'

  @Column()
  template_name: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  html_content: string;

  @Column({ type: 'text', nullable: true })
  text_content: string;

  @Column({ type: 'json', nullable: true })
  variables: Record<string, any>; // Variables esperadas en la plantilla

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
