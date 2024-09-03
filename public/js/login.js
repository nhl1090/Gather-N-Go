document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('.login-form');
  const signupForm = document.querySelector('.signup-form');

  console.log('login.js loaded');

const loginFormHandler = async (event) => {
  event.preventDefault();
  console.log('Login form submitted');

  const login = document.querySelector('#email-login').value.trim();
  const password = document.querySelector('#password-login').value.trim();

  if (login && password) {
    try {
      console.log('Sending login request');
      const response = await fetch('/api/users/login', {
        method: 'POST',
        body: JSON.stringify({ login, password }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok) {
        console.log('Login successful, redirecting to:', data.redirect || '/dashboard');
        document.location.replace(data.redirect || '/dashboard');
      } else {
        console.error('Login failed:', data.message);
        alert(data.message || 'Failed to log in');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login. Please try again.');
    }
  } else {
    console.warn('Login or password is empty');
    alert('Please enter both email/username and password');
  }
};

const signupFormHandler = async (event) => {
  event.preventDefault();
  console.log('Signup form submitted');

  const username = document.querySelector('#username-signup').value.trim();
  const email = document.querySelector('#email-signup').value.trim();
  const password = document.querySelector('#password-signup').value.trim();

  if (username && email && password) {
    try {
      console.log('Sending signup request');
      const response = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      console.log('Signup response:', data);

      if (response.ok) {
        console.log('Signup successful, redirecting to:', data.redirect || '/dashboard');
        document.location.replace(data.redirect || '/dashboard');
      } else {
        console.error('Signup failed:', data.message);
        alert(data.message || 'Failed to sign up');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('An error occurred during signup. Please try again.');
    }
  } else {
    console.warn('One or more signup fields are empty');
    alert('Please fill in all fields');
  }
};

if (loginForm) {
    console.log('Login form found, attaching event listener');
    loginForm.addEventListener('submit', loginFormHandler);
  }

  if (signupForm) {
    console.log('Signup form found, attaching event listener');
    signupForm.addEventListener('submit', signupFormHandler);
  }
});