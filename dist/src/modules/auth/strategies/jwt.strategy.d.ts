import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly prisma;
    private readonly config;
    constructor(prisma: PrismaService, config: ConfigService);
    validate(payload: {
        sub: string;
        username: string;
    }): Promise<any>;
}
export {};
