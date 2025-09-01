export const handleGithubRedirect = (username: string) => {
  window.open(`https://github.com/${username}`, "_blank");
}