import { Controller, Get, Query } from '@nestjs/common';
import { GithubService } from './github.service';

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('combine')
  async combineFiles(
    @Query('owner') owner: string,
    @Query('repo') repo: string,
  ): Promise<string> {
    await this.githubService.combineFilesIntoMarkdown(owner, repo);
    return 'Files combined successfully into combined_output.md';
  }
}
