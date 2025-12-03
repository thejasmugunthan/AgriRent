export const getCurrentUser = () => {
  try {
    const userJson = localStorage.getItem("user");
    return userJson ? JSON.parse(userJson) : null;
  } catch {
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("userId");
  window.location.href = "/login";
};
