const git = require('simple-git/promise')(process.cwd());
const env = process.argv[2] || 'test'; // test 或者 formal
let msg = process.argv[3] || ''; // 正式上线需要对tag进行说明

async function execs() {
    // 增加对msg的检测必须是tapd单号，不能为空
    if (env == 'formal') {
        if (msg != '') {
            // 测试tag没有填msg的话 默认为--other=deploy
            msg = msg || '--other=deploy';
        } else {
            console.error('======== error =========');
            console.error('======== 正式上线，tag msg需要关联tapd单号，使用如下命令 ========');
            console.error('======== msg需要从tapd获取 具体获取参照readme, 一个完整的示例如下 ========');
            console.error('======== npm run publish:formal "--story=857258227 内容定制产品功能埋点" ========');
            return;
        }
    }
    await git.raw(['fetch', '--tags']);
    let tags = await git.tags();
    tags = convertTags(tags.all);
    console.log('git tags: ');
    console.log(tags[env]);
    let newTag = getNewTag(tags[env].pop(), env);
    console.log('new tag: ', newTag);
    console.log('tag msg: ', msg);
    await git.addAnnotatedTag(newTag, msg);
    console.log('tag push...');
    await git.pushTags('origin');
    console.log('tag push finished');
}

const convertTags = (tags) => {
    let formal = [];
    let test = [];
    tags.forEach(element => {
        if (/^test_\d+[.]\d+[.]\d+$/.test(element)) {
            test.push(element);
        } else if (/^formal_\d+[.]\d+[.]\d+$/.test(element)) {
            formal.push(element);
        }
    });
    return { formal, test };
};

const getNewTag = (latestTag, env) => {
    // eslint-disable-next-line no-undefined
    if (latestTag === undefined) {
        return [env, '1.0.0'].join('_');
    }
    const [env1, version] = latestTag.split('_');
    let arr = version.split('.');
    arr = arr.map(e => Number(e));
    // 大数加法的方式 实现 tag累加
    arr[1] += parseInt((arr[2] + 1) / 10, 10);
    arr[2] = (arr[2] + 1) % 10;
    arr[0] += parseInt(arr[1] / 10, 10);
    arr[1] = arr[1] % 10;
    return [env1, arr.join('.')].join('_');
};

execs();