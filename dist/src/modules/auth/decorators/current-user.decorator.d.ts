export type AuthUser = {
    id: string;
    username: string;
    role: string;
};
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
