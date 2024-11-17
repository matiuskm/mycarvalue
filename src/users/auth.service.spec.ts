import { Test } from "@nestjs/testing"
import { AuthService } from "./auth.service"
import { UsersService } from "./users.service"
import { User } from "./user.entity"
import { BadRequestException } from "@nestjs/common"

describe("AuthService", () => {

    let service: AuthService
    let fakeUsersService: Partial<UsersService>

    beforeEach(async () => {
        const users: User[] = []

        // create a fake copy of users service
        fakeUsersService = {
            find: (email: string) => {
                const filteredUsers = users.filter(user => user.email === email)
                return Promise.resolve(filteredUsers)
            },
            create: (email: string, password: string) => {
                const user = { id: Math.floor(Math.random() * 999999), email, password } as User
                users.push(user)
                return Promise.resolve(user)
            }
        }

        const module = await Test.createTestingModule({
            providers: [AuthService, {
                provide: UsersService,
                useValue: fakeUsersService
            }]
        }).compile()

        service = module.get(AuthService)
    })

    it('can create an instance of auth service', async () => {
        expect(service).toBeDefined()
    })

    it('creates a new user with salted and hashed password', async () => {
        const user = await service.signup('Qm2dE@example.com', 'asdf')
        expect(user.password).not.toEqual('asdf')
        const [salt, hash] = user.password.split(':')
        expect(salt).toBeDefined()
        expect(hash).toBeDefined()
    })

    it('throws an error if signup is called with used email', async () => {
        await service.signup('Qm2dE@example.com', 'asdf')
        await expect(service.signup('Qm2dE@example.com', 'asdf')).rejects.toThrow(
            BadRequestException,
        )
    })

    it('throws if signin is called with unused email', async () => {
        await expect(service.signin('Qm2dE@example.com', 'asdf')).rejects.toThrow(
            BadRequestException,
        )
    })

    it('throws if signin is called with wrong password', async () => {
        await service.signup('Qm2dE@example.com', 'asdf')
        await expect(service.signin('Qm2dE@example.com', '2312')).rejects.toThrow(
            BadRequestException,
        )
    })

    it('returns user if correct password is provided', async () => {
        await service.signup('Qm2dE@example.com', 'asdf')        
        const user = await service.signin('Qm2dE@example.com', 'asdf')
        expect(user).toBeDefined()
    })
})