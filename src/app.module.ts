import { ConfigModule } from '@nestjs/config'
import { DevtoolsModule } from '@nestjs/devtools-integration'
import { LoggerModule } from 'nestjs-pino'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'

import { PrismaModule } from './prisma/prisma.module'
import { AppConfigModule } from './common/config/config.module'
import { SecurityMiddleware } from './common/middleware/security.middleware'
import { UsersModule } from './modules/users/users.module'
import { CountriesModule } from './modules/countries/countries.module'
import { CitiesModule } from './modules/cities/cities.module'
import { AuthModule } from './modules/auth/auth.module'
import { PostsModule } from './modules/posts/posts.module'
import { ProfessionsModule } from './modules/professions/professions.module'
import { ProjectsModule } from './modules/projects/projects.module'
import { RoadmapsModule } from './modules/roadmaps/roadmaps.module'
import { InstitutionsModule } from './modules/institutions/institutions.module'
import { TestsModule } from './modules/tests/tests.module'

@Module({
	imports: [
		// Dev / logging
		DevtoolsModule.register({ http: process.env.NODE_ENV !== 'production' }),
		LoggerModule.forRoot({
			pinoHttp: {
				level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
				transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
			},
		}),

		// Global config & DB
		ConfigModule.forRoot({ isGlobal: true }),
		AppConfigModule,
		PrismaModule,
		AuthModule,
		UsersModule,
		CountriesModule,
		CitiesModule,
		ProfessionsModule,
		PostsModule,
		ProjectsModule,
		RoadmapsModule,
		InstitutionsModule,
		TestsModule,
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(SecurityMiddleware).forRoutes('*')
	}
}
