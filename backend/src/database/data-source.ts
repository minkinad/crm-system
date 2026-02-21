import 'dotenv/config';
import { DataSource } from 'typeorm';

// TypeORM datasource for migrations and CLI operations.
export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  username: process.env.POSTGRES_USER ?? 'crm',
  password: process.env.POSTGRES_PASSWORD ?? 'crm',
  database: process.env.POSTGRES_DB ?? 'crm',
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false
});
