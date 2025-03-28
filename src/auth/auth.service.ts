import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/user.entity'; // Import User entity

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new Error('Email not found');
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      throw new Error('Invalid password');
    }

    return user;
  }

  login(user: { id: string; email: string }) {
    const payload = { email: user.email, sub: user.id };
    console.log('Payload for JWT:', payload); // Log the payload used to generate the token
    const token = this.jwtService.sign(payload, {
      expiresIn: '1h', // Token expiration time
    });
    console.log('Generated JWT token:', payload); // Log the generated token

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async register(
    createUserDto: CreateUserDto,
  ): Promise<{ accessToken: string; user: { id: string; email: string } }> {
    const user = await this.usersService.create(createUserDto);
    return this.login(user);
  }
}
