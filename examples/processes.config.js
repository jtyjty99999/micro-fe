module.exports = {
    apps: [{
        name: 'portal',
        watch: false,
        exec_mode: 'fork_mode',
        cwd: './portal',
        script: 'npm run watch'
    },{
        name: 'baseComponent',
        watch: false,
        exec_mode: 'fork_mode',
        cwd: '../baseComponent',
        script: 'npm run watch:portal'
    },{
        name: 'app1React',
        watch: false,
        cwd: './app1React',
        exec_mode: 'fork_mode',
        script: 'npm run watch:portal'
    },{
        name: 'app4vue',
        watch: false,
        cwd: '../app4vue',
        exec_mode: 'fork_mode',
        script: 'npm run watch:portal'
    },{
        name: 'app6Vanilla',
        watch: false,
        cwd: '../app6Vanilla',
        exec_mode: 'fork_mode',
        script: 'npm run watch'
    },{
        name: 'json-server',
        watch: false,
        cwd: '../app6Vanilla',
        exec_mode: 'fork_mode',
        script: 'json-server db.json'
    }]
};