import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RepoService {
    async getRepo(token:string) {
        const url = `https://api.github.com/user/repos`;

        const repo = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            }
        });

        const repoNames = repo.data.map(r => r.name);
        return {
            repo:repoNames
        }
    }

    async saveFiles(token:string,username:string,repoName:string) {
        const url = `https://api.github.com/repos/${username}/${repoName}/contents`
        console.log (url)        
        const res = await axios.get(url, {
            headers: {
                Authorization:`Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json',
            }
        });

        console.log(res.statusText)
        
        const names = res.data
            .filter((item) => item.type === 'file' || item.type === 'dir')
            .map((item) => item.name);

        console.log(names);
    }
}
