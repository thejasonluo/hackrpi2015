http=require('http');

var options = {
  hostname: 'api.bigoven.com',
  port: 80,
  path: '/recipes?format=html&explaintext=&exsectionformat=plain&title_kw=chicken&pg=1&rpp=1&api_key=m05F8PjKe42DE6nqaUJpU17dKc91BJ1J',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

var req = http.request(options, function(res) {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log('BODY: ' + chunk);
  });
  res.on('end', function() {
    console.log('No more data in response.')
  })
});

req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

// write data to request body
req.end();