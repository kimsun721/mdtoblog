import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn({unsigned:true})
    user_id:number

    @Column({unique:true,length:50})
    email:string

    @Column({unique:true,length:500})
    username:string
    
    @Column({type:"varchar",nullable:true})
    password:string | null
}