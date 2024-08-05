fetch('http://localhost:3000/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url: window.location.href })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Scraped Data:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
  