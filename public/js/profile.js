const updateBioHandler = async (event) => {
    event.preventDefault();
  
    const bio = document.querySelector('#user-bio').value.trim();
  
    const response = await fetch(`/api/users/bio`, {
      method: 'PUT',
      body: JSON.stringify({ bio }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    if (response.ok) {
      document.location.replace('/profile');
    } else {
      alert('Failed to update bio');
    }
  };
  
  const uploadProfilePicHandler = async (event) => {
    event.preventDefault();
  
    const fileInput = document.querySelector('#profile-pic');
    const formData = new FormData();
    formData.append('profile-pic', fileInput.files[0]);
  
    const response = await fetch(`/api/users/profile-picture`, {
      method: 'POST',
      body: formData,
    });
  
    if (response.ok) {
      document.location.replace('/profile');
    } else {
      alert('Failed to upload profile picture');
    }
  };
  
  document.querySelector('.bio-form').addEventListener('submit', updateBioHandler);
  document.querySelector('.upload-form').addEventListener('submit', uploadProfilePicHandler);