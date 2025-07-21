import { CreateRepoDto } from 'src/dto/RequestDto/CreateRepoDto';
import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import * as CryptoJS from "crypto-js"
import { Repo } from 'src/entities/repo.entity';
import { Post } from 'src/entities/post.entity';

@Injectable()
export class RepoService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository : Repository<User>,
        
        @InjectRepository(Repo)
        private readonly repoRepository : Repository<Repo>,

        @InjectRepository(Post)
        private readonly postRepository : Repository<Post>,
        
        private readonly configService : ConfigService,
    ) {}

    private header(token:string) {
        return {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
        }
    }

    async getMdFilesPaths(userId:number):Promise <{repo:string[]}> {

        const token = await this.tokenDecrypt(userId)
        const url = `https://api.github.com/user/repos`;

        const repo = await axios.get(url,{headers: this.header(token)});

        const repoNames = repo.data.map(r => r.name);
        return {
            repo:repoNames
        }
    }

    async createRepo(userId:number,username:string,dto:CreateRepoDto) {
        const { repoName,ignorePath,refreshIntervalMinutes } = dto
        const token = await this.tokenDecrypt(userId)

        const mdFiles:string[] = []

        const borwseDir = async (path:string) => {
            const url = `https://api.github.com/repos/${username}/${repoName}/contents/${path}`
         
            const res = await axios.get(url, {headers:this.header(token)});

            const data = res.data
        
            for(const item of data) {
                if(item.type === "dir") {   
                    await borwseDir(item.path)
                } else if (item.type === "file" && item.path.endsWith(".md")) {
                    mdFiles.push(item.path)
                }
            }
        }   
    
        await borwseDir('')

        const user = await this.userRepository.findOneBy({id:userId})
        if(!user) throw new BadRequestException("토큰 정보가 올바르지 않습니다")

        try {
            await this.repoRepository.save({
                user,
                repo:mdFiles,
                refresh_interval_minutes:refreshIntervalMinutes,
                ignore_path:ignorePath
            })
        } catch(e) {
            throw new BadRequestException()
        }

        await this.createPosts(userId,username,repoName,token,mdFiles)
    }

    async createPosts(
        userId:number,
        username:string,
        repoName:string,
        token:string,
        mdFiles:string[]
    ) {
        const user = await this.userRepository.findOneBy({id:userId})
        if(!user) throw new BadRequestException("토큰 정보가 올바르지 않습니다")

        for(const path of mdFiles) {
            const url = `https://api.github.com/repos/${username}/${repoName}/contents/${path}`
            const res = await axios.get(url, {headers:this.header(token)});
            let content = Buffer.from(res.data.content, 'base64').toString('utf-8')
            let firstLine = content.split('\n')[0]
            
            console.log(firstLine)
            
            if(firstLine == "") {
                firstLine ="무제"
            }
            await this.postRepository.save({ 
                user,
                title:firstLine,
                content
            })
        }
    }

    async tokenDecrypt(userId:number):Promise <string> {
        const secretKey = this.configService.get<string>("CRYPTO_SECRET")

        const res = await this.userRepository.findOneBy({ id:userId })

        if(!res) {
            throw new ForbiddenException("토큰 정보가 올바르지 않습니다")
        }

        const bytes = CryptoJS.AES.decrypt(res?.access_token, secretKey)
        const token = bytes.toString(CryptoJS.enc.Utf8);

        return token
    }
}
