document.addEventListener('DOMContentLoaded', function() {
    const map = L.map('map').setView([0, 0], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const locationElement = document.querySelector('.event-location');
    const locationText = locationElement.textContent.trim();

    function geocodeAddress(address) {
        return fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    return {
                        lat: parseFloat(data[0].lat),
                        lon: parseFloat(data[0].lon)
                    };
                }
                throw new Error('Location not found');
            });
    }

    geocodeAddress(locationText)
        .then(coords => {
            map.setView([coords.lat, coords.lon], 15);
            L.marker([coords.lat, coords.lon]).addTo(map)
                .bindPopup(locationText)
                .openPopup();
        })
        .catch(error => {
            console.error('Error with full address:', error);
            const cityState = locationText.split(',').slice(-2).join(',').trim();
            return geocodeAddress(cityState);
        })
        .then(coords => {
            map.setView([coords.lat, coords.lon], 10);
            L.marker([coords.lat, coords.lon]).addTo(map)
                .bindPopup("Approximate location")
                .openPopup();
        })
        .catch(error => {
            console.error('Final error:', error);
            map.setView([39.8283, -98.5795], 4);
            L.popup()
                .setLatLng([39.8283, -98.5795])
                .setContent("Location not found. Showing general area.")
                .openOn(map);
        });

    const rsvpHandler = async (event) => {
        event.preventDefault();

        const event_id = window.location.pathname.split('/').pop();

        try {
            const response = await fetch('/api/rsvps', {
                method: 'POST',
                body: JSON.stringify({ event_id }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                alert('Successfully RSVP\'d to the event!');
                document.querySelector('#rsvp-btn').disabled = true;
                document.querySelector('#rsvp-btn').textContent = 'RSVP\'d';
            } else {
                alert(data.message || 'Failed to RSVP. Please try again.');
            }
        } catch (error) {
            console.error('RSVP error:', error);
            alert('An error occurred while trying to RSVP. Please try again later.');
        }
    };

    const rsvpButton = document.querySelector('#rsvp-btn');
    if (rsvpButton) {
        rsvpButton.addEventListener('click', rsvpHandler);
    }
});