module.exports = {
    apps: [{
        name: 'portal',
        watch: false,
        exec_mode: 'fork_mode',
        cwd: '/',
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
        cwd: '../app1React',
        exec_mode: 'fork_mode',
        script: 'npm run watch:portal'
    },{
        name: 'app2Angular',
        watch: false,
        cwd: '../app2Angular',
        exec_mode: 'fork_mode',
        script: 'npm run watch:portal'
    },{
        name: 'app3Angular1',
        watch: false,
        cwd: '../app3Angular1',
        exec_mode: 'fork_mode',
        script: 'npm run watch:portal'
    },{
        name: 'app4vue',
        watch: false,
        cwd: '../app4vue',
        exec_mode: 'fork_mode',
        script: 'npm run watch:portal'
    },{
        name: 'app5Angular',
        watch: false,
        cwd: '../app5Angular',
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