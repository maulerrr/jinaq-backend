import { Module } from '@nestjs/common'
import { PostsController } from './posts.controller'
import { PostsService } from './posts.service'
import { PrismaModule } from 'src/prisma/prisma.module'
import { AuthModule } from '../auth/auth.module'
import { CommonModule } from 'src/common/common.module'

@Module({
	imports: [PrismaModule, AuthModule, CommonModule],
	controllers: [PostsController],
	providers: [PostsService],
})
export class PostsModule {}
