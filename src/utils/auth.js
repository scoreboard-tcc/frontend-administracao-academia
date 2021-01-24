import jwtDecode from 'jwt-decode';

export default function getAuthenticationToken() {
  const token = localStorage.getItem('Authorization');

  if (!token) {
    return false;
  }

  try {
    const decodedToken = jwtDecode(token);

    if (!decodedToken) {
      return false;
    }

    return decodedToken;
  } catch (error) {
    return false;
  }
}
