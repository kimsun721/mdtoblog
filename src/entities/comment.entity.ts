import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Post } from "./post.entity";

@Entity()
export class Comment {
    @PrimaryGeneratedColumn({unsigned:true})
    id:number

    @ManyToOne(() => User, (user) => user.comment)
    @JoinColumn({ name: 'user_id' })
    user:User;

    @Column({nullable:true,type:"int"})
    parent_id:number;

    @Column({nullable:false,type:"text"})
    content:string;

    @ManyToOne(() => Post, (post) => post.comment,{ onDelete:'CASCADE'})
    @JoinColumn({ name : "target_id" })
    post:Post;

    @Column({nullable:false,type:"datetime"})
    created_at:Date;

    @Column({nullable:false,type:"datetime"})
    updated_at:Date;    
}