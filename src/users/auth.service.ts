import { BadRequestException, Injectable } from "@nestjs/common";
import { UsersService } from "./users.service";
import { promisify } from "util";
import { scrypt as _scrypt, randomBytes} from "crypto";

const scrypt = promisify(_scrypt)

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService) {}

    async signup(email: string, password: string) {
        // see if email is in use
        const users = await this.usersService.find(email)
        if (users.length) {
            throw new BadRequestException('Email has been used.')
        }

        // hash user password
        // generate a salt
        const salt = randomBytes(8).toString('hex')

        // hash salt and password
        const hash = (await scrypt(password, salt, 32)) as Buffer

        // join the hash result and salt together
        const result = salt + ':' + hash.toString('hex')

        // create new user and save it
        const user = await this.usersService.create(email, result)

        // return new created user
        return user
    }

    async signin(email: string, password: string) {
        const [user] = await this.usersService.find(email)
        if (!user) {
            throw new BadRequestException('Invalid email or password.')
        }

        const [salt, storedHash] = user.password.split(':')

        const hash = (await scrypt(password, salt, 32)) as Buffer

        if (storedHash !== hash.toString('hex')) {
            throw new BadRequestException("Invalid email or password.");
        }

        return user
    }
}
