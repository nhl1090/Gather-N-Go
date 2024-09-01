const loginFormHandler = async (event) => {
  event.preventDefault();

  const login = document.querySelector('#email-login').value.trim();
  const password = document.querySelector('#password-login').value.trim();
  const rememberMe = document.querySelector('#remember-me').checked;

  if (login && password) {
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        body: JSON.stringify({ login, password }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        if (rememberMe) {
          localStorage.setItem('rememberedLogin', login);
          localStorage.setItem('rememberedPassword', password);
        } else {
          localStorage.removeItem('rememberedLogin');
          localStorage.removeItem('rememberedPassword');
        }
        if (data.redirect) {
          window.location.href = data.redirect;
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        alert(data.message || 'Failed to log in');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login. Please try again.');
    }
  } else {
    alert('Please enter both email/username and password');
  }
};

const signupFormHandler = async (event) => {
  event.preventDefault();

  const username = document.querySelector('#username-signup').value.trim();
  const email = document.querySelector('#email-signup').value.trim();
  const password = document.querySelector('#password-signup').value.trim();

  if (username && email && password) {
    if (password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        if (data.redirect) {
          window.location.href = data.redirect;
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        if (data.errors) {
          alert(data.errors.map(error => error.msg).join('\n'));
        } else {
          alert(data.message || 'Failed to sign up');
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('An error occurred during signup. Please try again.');
    }
  } else {
    alert('Please fill in all fields');
  }
};

// Function to pre-fill login form if remembered credentials exist
const prefillLoginForm = () => {
  const rememberedLogin = localStorage.getItem('rememberedLogin');
  const rememberedPassword = localStorage.getItem('rememberedPassword');
  
  if (rememberedLogin && rememberedPassword) {
    document.querySelector('#email-login').value = rememberedLogin;
    document.querySelector('#password-login').value = rememberedPassword;
    document.querySelector('#remember-me').checked = true;
  }
};

document.addEventListener('DOMContentLoaded', prefillLoginForm);
document.querySelector('.login-form')?.addEventListener('submit', loginFormHandler);
document.querySelector('.signup-form')?.addEventListener('submit', signupFormHandler);