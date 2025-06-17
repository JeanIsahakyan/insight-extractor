import { ConfigModule } from '@nestjs/config';
import databaseConfig from './database.config';
import { DataSource } from 'typeorm';
import { DataSourceOptions } from 'typeorm/data-source/DataSourceOptions';

ConfigModule.forRoot({
  isGlobal: true,
  load: [databaseConfig],
});

const AppDataSource = new DataSource(databaseConfig() as DataSourceOptions);

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });

export default AppDataSource;
