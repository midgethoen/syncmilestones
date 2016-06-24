#!/usr/bin/env node
'use strict';
var http = require("https");
const R = require('ramda')
try {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN
  if (!GITHUB_TOKEN){
    throw new Error('I can haz GITHUB_TOKEN')
  }

  var repos = process.argv.slice(2)
  if (repos.indexOf('-h') > -1 || repos.indexOf('--help') > -1){
    throw undefined
  }
  if (repos.length < 2) {
    throw new Error('I can haz more more repos?')
  }

  var sourceRepo = repos[0]
  var targetRepos = repos.slice(1)

  debug('getting source milestones')
  getMilestones(sourceRepo, function (err, milestones) {
    if (err){ throw err; }
    debug('got source milestones')
    targetRepos.forEach(function (repo) {
      milestones
        .filter( m => m.state === 'open')
        .forEach( m => updateMilestone(repo, m))
      })
  })


  function updateMilestone(repo, milestone) {
    getMilestones(repo, function (err, milestones) {
      if (err){ throw err }
      const counterpart = milestones.find(m => m.title === milestone.title)
      // debug(JSON.stringify([milestone, counterpart], null, 2))
      const number = counterpart ? counterpart.number : undefined

      let path, method
      if (number){
      debug(counterpart.url)
        path = `/repos/${repo}/milestones/${number}`
        method = 'PATCH'
      } else {
        path = `/repos/${repo}/milestones`
        method = 'POST'
      }
      var options = {
        "method": method,
        "hostname": "api.github.com",
        "path": path,
        "headers": {
          "content-type": "application/json",
          "authorization": `token ${GITHUB_TOKEN}`,
          "user-agent": "syncmilestones"
        }
      };

      var req = http.request(options, function (res) {
        var chunks = [];

        if (res.status < 200 || res.status >= 300){
          throw new Error(`received status ${res.status}`)
        }

        res.on("data", function (chunk) {
          chunks.push(chunk);
        });

        res.on("end", function () {
          debug(Buffer.concat(chunks).toString())
          console.log(`${milestone.title} => ${repo}`);

        });
      });

      req.write(JSON.stringify(
        R.pick(['title', 'description', 'due_on'], milestone)
      ))

      req.end();
    })
  }

  function getMilestones(repo, clb) {
    debug('get', repo)
    var options = {
      "method": "GET",
      "hostname": "api.github.com",
      "path": `/repos/${repo}/milestones`,
      "headers": {
        "content-type": "application/json",
        "authorization": `token ${GITHUB_TOKEN}`,
        "user-agent": "syncmilestones"
      }
    };
    var req = http.request(options, function (res) {
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        var body = Buffer.concat(chunks);
        clb(null, JSON.parse(body.toString()))
      });
    });
    req.end()
  }
} catch (e){
  if (e) {
    console.error(e)
  }
  console.error('Usage:')
  console.error('syncmilestones [source_repo], [target_repos, ...]')
}

function debug(){
  if (process.env.DEBUG){
    console.log.apply(console.log, arguments)
  }
}
