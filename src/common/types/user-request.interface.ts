// src/common/types/user-request.interface.ts
import { Request } from 'express'

export interface UserClaims {
	id: number
}

export interface UserRequest extends Request {
	user: UserClaims
}
