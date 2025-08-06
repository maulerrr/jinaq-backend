// src/common/helpers/file-upload.helper.ts

import { BadRequestException } from '@nestjs/common'
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface'
import { memoryStorage } from 'multer'
import { Request } from 'express'

/**
 * Image file filter for multer
 */
export const imageFileFilter = (
	req: Request,
	file: Express.Multer.File,
	cb: (error: Error | null, acceptFile: boolean) => void,
) => {
	const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

	if (allowedMimes.includes(file.mimetype)) {
		cb(null, true)
	} else {
		cb(
			new BadRequestException(
				'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
			),
			false,
		)
	}
}

/**
 * Standard image upload configuration for assessments
 */
export const createImageUploadConfig = (maxSizeMB: number = 5): MulterOptions => ({
	storage: memoryStorage(),
	limits: {
		fileSize: maxSizeMB * 1024 * 1024, // Convert MB to bytes
	},
	fileFilter: imageFileFilter,
})

/**
 * Common file size limits
 */
export const FILE_SIZE_LIMITS = {
	SMALL: 1, // 1MB
	MEDIUM: 5, // 5MB
	LARGE: 10, // 10MB
} as const
