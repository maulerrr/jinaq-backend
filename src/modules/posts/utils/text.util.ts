export function extractHashtags(text: string): string[] {
	const regex = /#(\w+)/g
	const matches = text.match(regex)
	if (matches) {
		return matches.map(match => match.substring(1))
	}
	return []
}

export function extractMentions(text: string): string[] {
	const regex = /@(\w+)/g
	const matches = text.match(regex)
	if (matches) {
		return matches.map(match => match.substring(1))
	}
	return []
}
