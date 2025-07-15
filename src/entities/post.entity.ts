import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Comment } from "./comment.entity";
import { User } from "./user.entity";

@Entity()
export class Post {
    @PrimaryGeneratedColumn({unsigned:true})
    id:number

    @OneToMany(() => Comment,(comment) => comment.post)
    comment:Comment[];

    @ManyToOne(() => User,(user) => user.post,{onDelete:"CASCADE"})
    @JoinColumn({name:"user_id"})
    user:User;

    @Column({nullable:false,type:"varchar",length:100})
    title:string;

    @Column({nullable:false,type:"text"})
    content:string;

    @Column({nullable:false,type:"datetime"})
    created_at:Date;

    @Column({nullable:false,type:"datetime"})
    updated_at:Date;   
}