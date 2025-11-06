export interface User {
    id?: string;
    firstName: string;
    lastName: string;
    age: number;
    email: string;
    password: string;
    createdAt?: Date;       
    updatedAt?: Date;  
}