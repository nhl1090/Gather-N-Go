document.addEventListener('DOMContentLoaded', () => {
  const newEventForm = document.querySelector('.new-event-form');
  const eventList = document.querySelector('.event-list');
  const bioForm = document.querySelector('.bio-form');
  const uploadForm = document.querySelector('.upload-form');

  if (newEventForm) {
    newEventForm.addEventListener('submit', newEventHandler);
  }

  if (eventList) {
    eventList.addEventListener('click', eventActionHandler);
  }

  if (bioForm) {
    bioForm.addEventListener('submit', updateBioHandler);
  }

  if (uploadForm) {
    uploadForm.addEventListener('submit', uploadProfilePicHandler);
  }

  fetchRSVPEvents();
});

const newEventHandler = async (event) => {
  event.preventDefault();

  const title = document.querySelector('#event-title').value.trim();
  const description = document.querySelector('#event-desc').value.trim();
  const date = document.querySelector('#event-date').value.trim();
  const location = document.querySelector('#event-location').value.trim();

  if (title && description && date && location) {
    const response = await fetch(`/api/events`, {
      method: 'POST',
      body: JSON.stringify({ title, description, date, location }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      document.location.replace('/dashboard');
    } else {
      alert('Failed to create event');
    }
  }
};

const eventActionHandler = async (event) => {
  if (event.target.hasAttribute('data-id')) {
    const id = event.target.getAttribute('data-id');

    if (event.target.classList.contains('delete-event')) {
      if (confirm('Are you sure you want to delete this event?')) {
        const response = await fetch(`/api/events/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          document.location.replace('/dashboard');
        } else {
          alert('Failed to delete event');
        }
      }
    } else if (event.target.classList.contains('edit-event')) {
      const eventCard = event.target.closest('.event-item');
      const { format_date_for_input } = require('./path/to/helpers.js');

      document.querySelector('#event-title').value = eventCard.querySelector('h4').textContent;
      document.querySelector('#event-desc').value = eventCard.querySelector('p:nth-child(2)').textContent;
      document.querySelector('#event-date').value = format_date_for_input(eventCard.querySelector('p:nth-child(3)').textContent.split(': ')[1]);
      document.querySelector('#event-location').value = eventCard.querySelector('p:nth-child(4)').textContent.split(': ')[1];
      
      const form = document.querySelector('.new-event-form');
      form.removeEventListener('submit', newEventHandler);
      form.addEventListener('submit', (e) => updateEventHandler(e, id));
      
      document.querySelector('.new-event-form button').textContent = 'Update Event';
    }
  }
};

const updateEventHandler = async (event, id) => {
  event.preventDefault();

  const title = document.querySelector('#event-title').value.trim();
  const description = document.querySelector('#event-desc').value.trim();
  const date = document.querySelector('#event-date').value.trim();
  const location = document.querySelector('#event-location').value.trim();

  if (title && description && date && location) {
    const response = await fetch(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title, description, date, location }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      document.location.replace('/dashboard');
    } else {
      alert('Failed to update event');
    }
  }
};

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
    document.location.reload();
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
    document.location.reload();
  } else {
    alert('Failed to upload profile picture');
  }
};

const fetchRSVPEvents = async () => {
  try {
    const response = await fetch('/api/rsvps/user');
    if (response.ok) {
      const rsvpEvents = await response.json();
      displayRSVPEvents(rsvpEvents);
    } else {
      console.error('Failed to fetch RSVP events');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

const displayRSVPEvents = (rsvpEvents) => {
  const rsvpContainer = document.querySelector('.dashboard-section:last-child');
  if (rsvpEvents.length === 0) {
    rsvpContainer.style.display = 'none';
    return;
  }

  rsvpContainer.style.display = 'block';
  const eventList = rsvpContainer.querySelector('.event-list');
  eventList.innerHTML = '';

  rsvpEvents.forEach(rsvp => {
    const eventItem = document.createElement('div');
    eventItem.classList.add('event-item');
    eventItem.innerHTML = `
      <h4>${rsvp.event.title}</h4>
      <p><strong>Date:</strong> ${format_date_for_input(rsvp.event.date)}</p>
      <p><strong>Location:</strong> ${rsvp.event.location}</p>
      <a href="/event/${rsvp.event.id}" class="btn btn-sm btn-info">View Event</a>
    `;
    eventList.appendChild(eventItem);
  });
};
