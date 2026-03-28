/** localStorage keys — used when cross-site cookies are blocked (common on mobile Safari). */
export const DTR_EMPLOYEE_TOKEN_KEY = "dtr_employee_token";
export const DTR_EMPLOYER_TOKEN_KEY = "dtr_employer_token";

export function setStoredEmployeeToken(token) {
  if (typeof window !== "undefined" && token) {
    localStorage.setItem(DTR_EMPLOYEE_TOKEN_KEY, token);
  }
}

export function setStoredEmployerToken(token) {
  if (typeof window !== "undefined" && token) {
    localStorage.setItem(DTR_EMPLOYER_TOKEN_KEY, token);
  }
}

export function clearEmployeeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(DTR_EMPLOYEE_TOKEN_KEY);
  }
}

export function clearEmployerToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(DTR_EMPLOYER_TOKEN_KEY);
  }
}
