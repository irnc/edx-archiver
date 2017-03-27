const fs = require('fs');
const request = require('request');
const mkdirp = require('mkdirp');
const j = request.jar();

const base = 'https://university.mongodb.com/api/v1/courses/';
const COURSE_URL = 'https://university.mongodb.com/api/v1/courses/M101JS/2017_March';

function getPath(url) {
  return 'data/' + url.substr(base.length);
}

// Set sessionid cookie used to authenticate to API.
j.setCookie(
  request.cookie(`sessionid=${process.env.SESSION_ID}`),
  'https://university.mongodb.com/'
);

request({ url: COURSE_URL, jar: j, json: true }, (err, response, body) => {
  if (response.statusCode === 401) {
    console.log(`Please provide up-to-date sessionid using SESSION_ID environment variable`);
    console.log(body);
    return;
  }

  console.log(require('util').inspect(body, { colors: true }));
  const resourcePath = getPath(body.href);

  mkdirp(resourcePath, (err) => {
    if (err) {
      console.log(`Failed to create ${dir}`);
      return;
    }

    fs.writeFileSync(`${resourcePath}.json`, JSON.stringify(body, null, 2));
  })
});
