// prisma/seed.ts

import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join, resolve } from 'path'

const prisma = new PrismaClient()

async function main() {
	const mockDir = resolve(__dirname, 'mock-data')
	const sqlFiles = [
		'countries.sql',
		'cities.sql',
		'professions.sql',
		'institutions.sql',
		'institution_majors.sql',
		'institution_enrollment_documents.sql',
		'institution_enrollment_requirements.sql',
		'tests.sql',
		'questions.sql',
		'answers.sql',
	]

	for (const file of sqlFiles) {
		const filePath = join(mockDir, file)
		console.log(`▶️  Seeding from ${file}...`)

		const sql = readFileSync(filePath, 'utf-8')
		// Split on semicolons (naïvely—won’t break on semis in strings)
		const statements = sql
			.split(';')
			.map(stmt => stmt.trim())
			.filter(stmt => stmt.length > 0)

		for (const stmt of statements) {
			// execute each statement separately
			await prisma.$executeRawUnsafe(stmt)
		}
	}
}

main()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(() => {
		prisma.$disconnect()
	})
