import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Repo } from "./repo.entity";
import { Comment } from "./comment.entity";
import { Post } from "./post.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn({unsigned:true})
    id:number

    @OneToOne(() => Repo,repo => repo.user)
    repo:Repo

    @OneToMany(() => Comment,(comment) => comment.user)
    comment:Comment[]

    @OneToMany(() => Comment,(comment) => comment.user)
    post:Post[]

    @Column({nullable:false,unique:true,length:50})
    email:string

    @Column({nullable:false,unique:true,length:500})
    username:string 

    @Column({nullable:false,type:"text"})
    access_token:string
}
