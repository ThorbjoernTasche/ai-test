import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GithubService {
  private baseUrl: string = 'https://api.github.com/repos';
  private token: string = process.env.GITHUB_PAT; // Use the token from the environment variable

  async getAllFiles(
    owner: string,
    repo: string,
    dir: string = '',
  ): Promise<string[]> {
    const url = `${this.baseUrl}/${owner}/${repo}/contents/${dir}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `token ${this.token}`,
      },
    });

    const files = [];
    for (const item of response.data) {
      if (item.type === 'file') {
        files.push(item.path);
      } else if (item.type === 'dir') {
        const nestedFiles = await this.getAllFiles(owner, repo, item.path);
        files.push(...nestedFiles);
      }
    }
    return files;
  }

  async downloadFileContent(
    owner: string,
    repo: string,
    filePath: string,
  ): Promise<string> {
    const url = `${this.baseUrl}/${owner}/${repo}/contents/${filePath}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `token ${this.token}`,
      },
    });

    const content = Buffer.from(response.data.content, 'base64').toString(
      'utf-8',
    );
    return content;
  }

  async combineFilesIntoMarkdown(owner: string, repo: string): Promise<void> {
    const allFiles = await this.getAllFiles(owner, repo);
    const outputFilePath = path.join(process.cwd(), 'combined_output.md');

    const writeStream = fs.createWriteStream(outputFilePath);

    for (const file of allFiles) {
      const content = await this.downloadFileContent(owner, repo, file);
      writeStream.write(`# ${file}\n\n`);
      writeStream.write(content + '\n\n');
    }

    writeStream.end();
    console.log(`All files have been combined into ${outputFilePath}`);
  }
}
