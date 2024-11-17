import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>
  let fakeAuthService: Partial<AuthService>

  beforeEach(async () => {
    fakeUsersService = {
      find: (email: string) => Promise.resolve([{ id: 1, email, password: 'asdf' } as User]),
      findOne: (id: number) => Promise.resolve({ id, email: 'Qm2dE@example.com', password: 'asdf' } as User),
      remove: (id: number) => Promise.resolve({ id } as User),
      update: (id: number, attrs: Partial<User>) => Promise.resolve({ id, ...attrs } as User)
    }

    fakeAuthService = {
      signup: (email: string, password: string) => Promise.resolve({ id: Math.floor(Math.random() * 999999), email, password } as User),
      signin: (email: string, password: string) => Promise.resolve({ id: 1, email, password } as User)
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService
        },
        {
          provide: AuthService,
          useValue: fakeAuthService
        }
      ]
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.find('Qm2dE@example.com')
    expect(users.length).toEqual(1)
    expect(users[0].email).toEqual('Qm2dE@example.com')
  })

  it('findUser returns a single user with the given id', async () => {
    const user = await controller.findUser('1')
    expect(user).toBeDefined()
    expect(user.id).toEqual(1)
  })

  it('findUser returns an error if given invalid id', async () => {
    fakeUsersService.findOne = () => null
    await expect(controller.findUser('1')).rejects.toThrow(NotFoundException)
  })

  it('signin updates session object and returns user', async () => {
    const session = { userId: null }
    const user = await controller.signin({ email: 'Qm2dE@example.com', password: 'asdf' }, session)
    expect(user.id).toEqual(1)
    expect(session.userId).toEqual(1)
  })
});
