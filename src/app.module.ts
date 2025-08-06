import { ConfigModule } from '@nestjs/config'
import { DevtoolsModule } from '@nestjs/devtools-integration'
import { LoggerModule } from 'nestjs-pino'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'

import { PrismaModule } from './prisma/prisma.module'
import { AppConfigModule } from './common/config/config.module'
import { SecurityMiddleware } from './common/middleware/security.middleware'

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
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(SecurityMiddleware).forRoutes('*')
	}
}
