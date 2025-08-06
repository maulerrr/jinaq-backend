import { Injectable } from '@nestjs/common'
import { ConfigService as NestConfigService } from '@nestjs/config'

export interface DatabaseConfig {
	url: string
}
export interface JwtConfig {
	secret: string
	expiresIn: string
}
export interface ClientConfig {
	url: string
	cookieDomain: string
}
export interface OpenAIConfig {
	apiKey: string
	model: string // chat/completions
	ttsModel: string // e.g. "tts-1" or "gpt-4o-mini-tts"
	maxTokens: number
}

export interface SecurityConfig {
	backendCorsOrigins: string[]
	allowedHosts: string[]
}
export interface S3Config {
	accessEndpoint: string
	responseEndpoint: string
	region: string
	accessKeyId: string
	secretAccessKey: string
	bucket: string
	imagePrefix: string // e.g. “images/”
	usePathStyle: boolean
}

@Injectable()
export class AppConfigService {
	constructor(private readonly config: NestConfigService) {}

	private get<T = string>(key: string, defaultValue?: T): T {
		return defaultValue !== undefined
			? this.config.get<T>(key, defaultValue)
			: this.config.get<T>(key)!
	}

	get database(): DatabaseConfig {
		return {
			url: this.get<string>('DATABASE_URL'),
		}
	}

	// Separate JWT for admin
	get Jwt(): JwtConfig {
		return {
			secret: this.get<string>('JWT_SECRET', 'changeme'),
			expiresIn: this.get<string>('JWT_EXPIRATION', '720h'),
		}
	}

	get client(): ClientConfig {
		const url = this.get<string>('CLIENT_URL', 'http://localhost:3000')
		return {
			url,
			cookieDomain: new URL(url).hostname,
		}
	}

	get openai(): OpenAIConfig {
		return {
			apiKey: this.get<string>('OPENAI_API_KEY'),
			model: this.get<string>('OPENAI_MODEL', 'gpt-4.1-2025-04-14'),
			ttsModel: this.get('OPENAI_TTS_MODEL', 'tts-1'),
			maxTokens: this.get<number>('OPENAI_MAX_TOKENS', 1000),
		}
	}

	get s3(): S3Config {
		return {
			accessEndpoint: this.get<string>('S3_ACCESS_ENDPOINT', 'http://localhost:9000'),
			responseEndpoint: this.get<string>('S3_RESPONSE_ENDPOINT', 'http://localhost:9000'),
			region: this.get<string>('S3_REGION', 'ap-northeast-2'),
			accessKeyId: this.get<string>('S3_ACCESS_KEY', 'minio'),
			secretAccessKey: this.get<string>('S3_SECRET_KEY', 'minio123'),
			bucket: this.get<string>('S3_BUCKET', 'jinaq-media'),
			imagePrefix: this.get<string>('S3_IMAGE_PREFIX', 'images'),
			usePathStyle: this.get<boolean>('S3_PATH_STYLE', true),
		}
	}

	get nodeEnv(): string {
		return this.get<string>('NODE_ENV', 'development')
	}
	get isProduction(): boolean {
		return this.nodeEnv === 'production'
	}

	get security(): SecurityConfig {
		return {
			backendCorsOrigins: this.get<string>('SECURITY_BACKEND_CORS_ORIGINS', '').split(','),
			allowedHosts: this.get<string>('SECURITY_ALLOWED_HOSTS', '').split(','),
		}
	}
}
