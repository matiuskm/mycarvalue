import { Test } from "@nestjs/testing"
import { AuthService } from "./auth.service"
import { UsersService } from "./users.service"
import { User } from "./user.entity"
import { BadRequestException } from "@nestjs/common"

describe("AuthService", () => {

    let service: AuthService
    let fakeUsersService: Partial<UsersService>

    beforeEach(async () => {
        // create a fake copy of users service
        fakeUsersService = {
            find: () => Promise.resolve([]),
            create: (email: string, password: string) => Promise.resolve({ id: 1, email, password } as User)
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
        fakeUsersService.find = () => Promise.resolve([{ id: 1, email: 'Qm2dE@example.com', password: 'asdf' } as User])
        await expect(service.signup('Qm2dE@example.com', 'asdf')).rejects.toThrow(
            BadRequestException,
        )
    })
})