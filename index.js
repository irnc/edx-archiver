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

function getPage(url, callback) {
  request({ url, jar: j, json: true }, (err, response, body) => {
    if (response.statusCode === 401) {
      console.log(`Please provide up-to-date sessionid using SESSION_ID environment variable`);
      console.log(body);
      return;
    }

    const resourcePath = getPath(body.href);

    mkdirp(resourcePath, (err) => {
      if (err) {
        console.log(`Failed to create ${dir}`);
        return;
      }

      fs.writeFileSync(`${resourcePath}.json`, JSON.stringify(body, null, 2));
      callback(null, body);
    })
  });
}

function run(fn, q) {
  if (q.length === 0) {
    console.log('end of queue');
    return;
  }

  console.log(`running fn for ${q[0]}`);
  fn(q[0], (err, data) => {
    if (err) {
      console.log(err);
      return;
    }

    console.log(require('util').inspect(data, { colors: true }));

    let remainingQueue = q.slice(1);

    if (data.children) {
      remainingQueue = remainingQueue.concat(data.children.map(c => c.href));
    }

    run(fn, remainingQueue);
  })
}

run(getPage, [ COURSE_URL ]);
