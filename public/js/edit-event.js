const editEventHandler = async (event) => {
    event.preventDefault();
  
    const title = document.querySelector('#event-title').value.trim();
    const description = document.querySelector('#event-desc').value.trim();
    const date = document.querySelector('#event-date').value.trim();
    const location = document.querySelector('#event-location').value.trim();
    const id = document.querySelector('#edit-event-form').getAttribute('data-event-id');
  
    if (title && description && date && location) {
      const response = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, description, date, location }),
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (response.ok) {
        document.location.replace('/dashboard');
      } else {
        alert('Failed to update event');
      }
    }
  };
  
  document.querySelector('#edit-event-form').addEventListener('submit', editEventHandler);