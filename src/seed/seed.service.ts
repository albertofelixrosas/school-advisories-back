import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/user-role.enum';
import { Career } from '../careers/entities/career.entity';
import { StudyPlan } from '../study-plans/entities/study-plan.entity';
import { PlanSubject } from '../plan-subjects/entities/plan-subject.entity';
import { Subject } from '../subjects/entities/subject.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Career)
    private careersRepo: Repository<Career>,
    @InjectRepository(StudyPlan)
    private studyPlansRepo: Repository<StudyPlan>,
    @InjectRepository(PlanSubject)
    private planSubjectsRepo: Repository<PlanSubject>,
    @InjectRepository(Subject)
    private subjectsRepo: Repository<Subject>,
  ) {}

  async seedDatabase() {
    console.log('🌱 Iniciando seeding de la base de datos...');

    // Limpiar tablas existentes
    await this.clearUsers();
    await this.clearAcademicData();

    // Crear datos académicos desde CSVs
    const careers = await this.createCareers();
    console.log(`✅ Creadas ${careers.length} carreras`);

    const studyPlans = await this.createStudyPlans();
    console.log(`✅ Creados ${studyPlans.length} planes de estudio`);

    const subjects = await this.createSubjects();
    console.log(`✅ Creadas ${subjects.length} materias`);

    const planSubjects = await this.createPlanSubjects();
    console.log(`✅ Creadas ${planSubjects.length} asignaciones materia-plan`);

    // Crear usuarios de prueba
    const users = await this.createUsers();
    console.log(`✅ Creados ${users.length} usuarios`);

    console.log('🎉 Seeding completado exitosamente!');

    return {
      message: 'Base de datos poblada exitosamente',
      data: {
        careers: careers.length,
        studyPlans: studyPlans.length,
        subjects: subjects.length,
        planSubjects: planSubjects.length,
        users: users.length,
      },
      credentials: {
        admin: { username: 'admin', password: '123456' },
        professor: { username: 'mgarcia', password: '123456' },
        student: { username: 'alopez', password: '123456' },
      },
    };
  }

  private async clearUsers() {
    console.log('🧹 Limpiando usuarios existentes...');
    try {
      // Eliminar usuarios con delete() que respeta las foreign keys
      await this.usersRepo.delete({});
      console.log('🗑️ Tabla de usuarios limpiada exitosamente');
    } catch (error) {
      console.log(
        '⚠️ Error limpiando usuarios, continuando con la creación...',
      );
      console.log('Error:', error.message);
    }
  }

  private async clearAcademicData() {
    console.log('🧹 Limpiando datos académicos existentes...');
    try {
      // Eliminar en orden inverso a las dependencias
      await this.planSubjectsRepo.delete({});
      await this.studyPlansRepo.delete({});
      await this.careersRepo.delete({});
      // Nota: no borramos subjects porque pueden estar en uso por subject_details
      console.log('🗑️ Datos académicos limpiados exitosamente');
    } catch (error) {
      console.log(
        '⚠️ Error limpiando datos académicos, continuando con la creación...',
      );
      console.log('Error:', error.message);
    }
  }

  private readCSV(fileName: string): any[] {
    const filePath = path.join(process.cwd(), 'Datos', fileName);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.trim().split('\n');
    const headers = lines[0].split(',');

    return lines.slice(1).map((line) => {
      const values = line.split(',');
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header.trim()] = values[index]?.trim() || '';
      });
      return obj;
    });
  }

  private async createCareers(): Promise<Career[]> {
    console.log('📚 Creando carreras desde CSV...');
    const careersData = this.readCSV('carreras.csv');
    const careers: Career[] = [];

    for (const data of careersData) {
      // Verificar si la carrera ya existe
      let career = await this.careersRepo.findOne({
        where: { name: data.nombre },
      });

      if (!career) {
        career = this.careersRepo.create({
          name: data.nombre,
          is_active: true,
        });
        career = await this.careersRepo.save(career);
      }

      careers.push(career);
    }

    return careers;
  }

  private async createStudyPlans(): Promise<StudyPlan[]> {
    console.log('📋 Creando planes de estudio desde CSV...');
    const plansData = this.readCSV('planes_estudio.csv');
    const studyPlans: StudyPlan[] = [];

    for (const data of plansData) {
      // Verificar si el plan ya existe
      let studyPlan = await this.studyPlansRepo.findOne({
        where: {
          career_id: parseInt(data.carrera_id),
          year: parseInt(data.anio),
        },
      });

      if (!studyPlan) {
        studyPlan = this.studyPlansRepo.create({
          career_id: parseInt(data.carrera_id),
          year: parseInt(data.anio),
          is_active: true,
        });
        studyPlan = await this.studyPlansRepo.save(studyPlan);
      }

      studyPlans.push(studyPlan);
    }

    return studyPlans;
  }

  private async createSubjects(): Promise<Subject[]> {
    console.log('📖 Creando materias desde CSV...');
    const subjectsData = this.readCSV('materias.csv');
    const subjects: Subject[] = [];

    for (const data of subjectsData) {
      // Verificar si la materia ya existe
      const existing = await this.subjectsRepo.findOne({
        where: { subject: data.nombre },
      });

      if (!existing) {
        const subject = this.subjectsRepo.create({
          subject: data.nombre,
        });
        const saved = await this.subjectsRepo.save(subject);
        subjects.push(saved);
      } else {
        subjects.push(existing);
      }
    }

    return subjects;
  }

  private async createPlanSubjects(): Promise<PlanSubject[]> {
    console.log('🔗 Creando relaciones plan-materia desde CSV...');
    const planSubjectsData = this.readCSV('plan_materias.csv');
    const planSubjects: PlanSubject[] = [];

    for (const data of planSubjectsData) {
      // Verificar si la relación ya existe
      let planSubject = await this.planSubjectsRepo.findOne({
        where: {
          study_plan_id: parseInt(data.plan_id),
          subject_id: parseInt(data.materia_id),
        },
      });

      if (!planSubject) {
        planSubject = this.planSubjectsRepo.create({
          study_plan_id: parseInt(data.plan_id),
          subject_id: parseInt(data.materia_id),
          semester: parseInt(data.semestre),
          is_required: true,
        });
        planSubject = await this.planSubjectsRepo.save(planSubject);
      }

      planSubjects.push(planSubject);
    }

    return planSubjects;
  }

  private async createUsers(): Promise<User[]> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('123456', saltRounds);

    const usersData = [
      {
        name: 'Carlos',
        last_name: 'Rodríguez López',
        email: 'admin@itson.edu.mx',
        phone_number: '+52 644 410 0001',
        school_id: 1,
        username: 'admin',
        password: hashedPassword,
        role: UserRole.ADMIN,
        is_active: true,
      },
      {
        name: 'María Elena',
        last_name: 'García Hernández',
        email: 'maria.garcia@itson.edu.mx',
        phone_number: '+52 644 410 0002',
        school_id: 1,
        username: 'mgarcia',
        password: hashedPassword,
        role: UserRole.PROFESSOR,
        is_active: true,
      },
      {
        name: 'Ana Sofía',
        last_name: 'López Morales',
        email: 'ana.lopez@potros.itson.edu.mx',
        phone_number: '+52 644 410 0004',
        school_id: 1,
        username: 'alopez',
        password: hashedPassword,
        role: UserRole.STUDENT,
        is_active: true,
      },
    ];

    const savedUsers: User[] = [];

    for (const userData of usersData) {
      // Verificar si el usuario ya existe por username
      let user = await this.usersRepo.findOne({
        where: { username: userData.username },
      });

      if (!user) {
        // Si no existe, crearlo
        user = this.usersRepo.create(userData);
        user = await this.usersRepo.save(user);
        console.log(`✨ Usuario creado: ${user.username}`);
      } else {
        console.log(`ℹ️ Usuario ya existe: ${user.username}`);
      }

      savedUsers.push(user);
    }

    return savedUsers;
  }

  async getUsersInfo() {
    const users = await this.usersRepo.find({
      select: [
        'user_id',
        'name',
        'last_name',
        'username',
        'email',
        'role',
        'is_active',
      ],
      order: { role: 'ASC', name: 'ASC' },
    });

    return {
      message: 'Usuarios disponibles para pruebas',
      users: users.map((user) => ({
        ...user,
        login_credentials: {
          username: user.username,
          password: '123456',
        },
      })),
    };
  }
}
