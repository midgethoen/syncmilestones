# syncmilestones

Very quick script to help sync milestones based on matching title. (very useful in combination with zenhub multi repo boards)

## Details
it wil update due date and description of milestones with a matching title 
or create a milestone if there is none with a matching title

## usage
```bash
$ npm install -g syncmilestones
$ syncmilestones -h
Usage:
syncmilestones [source_repo], [target_repos, ...]
$ GITHUB_TOKEN=t0k3n syncmilestones midgethoen/source_repo midgethoen/other midgethoen/target midgethoen/repos
...
```
