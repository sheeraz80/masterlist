// GitHub API integration utilities
import { Octokit } from '@octokit/rest';

// Export Octokit as GitHubClient for backward compatibility
export { Octokit as GitHubClient } from '@octokit/rest';

// Initialize Octokit client
export function createGitHubClient(token?: string) {
  return new Octokit({
    auth: token || process.env.GITHUB_TOKEN,
  });
}

// Repository operations
export async function getRepository(owner: string, repo: string, token?: string) {
  const octokit = createGitHubClient(token);
  try {
    const { data } = await octokit.repos.get({ owner, repo });
    return data;
  } catch (error) {
    console.error('Error fetching repository:', error);
    throw error;
  }
}

export async function listRepositories(token?: string) {
  const octokit = createGitHubClient(token);
  try {
    const { data } = await octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    });
    return data;
  } catch (error) {
    console.error('Error listing repositories:', error);
    throw error;
  }
}

export async function createRepository(
  name: string,
  options: {
    description?: string;
    private?: boolean;
    auto_init?: boolean;
    gitignore_template?: string;
    license_template?: string;
  },
  token?: string
) {
  const octokit = createGitHubClient(token);
  try {
    const { data } = await octokit.repos.createForAuthenticatedUser({
      name,
      description: options.description,
      private: options.private,
      auto_init: options.auto_init,
      gitignore_template: options.gitignore_template,
      license_template: options.license_template,
    });
    return data;
  } catch (error) {
    console.error('Error creating repository:', error);
    throw error;
  }
}

export async function deleteRepository(owner: string, repo: string, token?: string) {
  const octokit = createGitHubClient(token);
  try {
    await octokit.repos.delete({ owner, repo });
    return true;
  } catch (error) {
    console.error('Error deleting repository:', error);
    throw error;
  }
}

// File operations
export async function createOrUpdateFile(
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  options?: {
    branch?: string;
    sha?: string;
  },
  token?: string
) {
  const octokit = createGitHubClient(token);
  try {
    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: Buffer.from(content).toString('base64'),
      branch: options?.branch,
      sha: options?.sha,
    });
    return data;
  } catch (error) {
    console.error('Error creating/updating file:', error);
    throw error;
  }
}

// Batch file creation
export async function createFiles(
  owner: string,
  repo: string,
  files: Record<string, string>,
  branch: string = 'main',
  token?: string
) {
  const results = [];
  for (const [path, content] of Object.entries(files)) {
    try {
      const result = await createOrUpdateFile(
        owner,
        repo,
        path,
        content,
        `Add ${path}`,
        { branch },
        token
      );
      results.push({ path, success: true, result });
    } catch (error) {
      results.push({ path, success: false, error });
    }
  }
  return results;
}

// Repository statistics
export async function getRepositoryStats(owner: string, repo: string, token?: string) {
  const octokit = createGitHubClient(token);
  try {
    const [repository, languages, contributors] = await Promise.all([
      octokit.repos.get({ owner, repo }),
      octokit.repos.listLanguages({ owner, repo }),
      octokit.repos.listContributors({ owner, repo, per_page: 10 }),
    ]);

    return {
      repository: repository.data,
      languages: languages.data,
      contributors: contributors.data,
    };
  } catch (error) {
    console.error('Error fetching repository stats:', error);
    throw error;
  }
}

// Check if repository exists
export async function checkRepositoryExists(owner: string, repo: string, token?: string): Promise<boolean> {
  const octokit = createGitHubClient(token);
  try {
    await octokit.repos.get({ owner, repo });
    return true;
  } catch (error: any) {
    if (error.status === 404) {
      return false;
    }
    throw error;
  }
}