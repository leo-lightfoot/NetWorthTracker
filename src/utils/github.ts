import { Octokit } from "@octokit/rest";

let octokit: Octokit | null = null;
let userData: any = null;

export const initGitHub = async (token: string) => {
  if (token) {
    octokit = new Octokit({ auth: token });
    
    // Store token in localStorage (consider encrypting it)
    localStorage.setItem('github_token', token);
    
    // Get user information to verify authentication
    const { data } = await octokit.users.getAuthenticated();
    userData = data;
    return userData;
  }
  return null;
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem('github_token');
};

export const logoutGitHub = () => {
  localStorage.removeItem('github_token');
  octokit = null;
  userData = null;
};

export const isAuthenticated = (): boolean => {
  return !!octokit && !!userData;
};

// Function to get CSV data from your repository
export const fetchCSVFromRepo = async (owner: string, repo: string, path: string) => {
  if (!octokit) throw new Error("Not authenticated");
  
  try {
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });
    
    // Check if the response data is a file (not a directory)
    if (!('content' in response.data)) {
      throw new Error('The specified path does not point to a file');
    }
    
    // Decode content from base64
    const content = Buffer.from(response.data.content, 'base64').toString();
    return {
      content,
      sha: response.data.sha // Important for updating the file later
    };
  } catch (error: any) {
    if (error.status === 404) {
      // File doesn't exist yet, return empty content
      return { content: '', sha: null };
    }
    throw error;
  }
};

// Function to update the CSV file in your repository
export const updateCSVInRepo = async (
  owner: string, 
  repo: string, 
  path: string, 
  content: string, 
  sha: string | null,
  commitMessage: string = ""
) => {
  if (!octokit) throw new Error("Not authenticated");
  
  const response = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message: commitMessage || `Update ${path}`,
    content: Buffer.from(content).toString('base64'),
    sha: sha || undefined,
  });
  
  return response.data;
}; 