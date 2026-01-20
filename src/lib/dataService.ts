export const logoutUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('channeling_current_user');
  }
};