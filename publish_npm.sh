# 修改包名称，以及添加文本限制, 此处需加空字符串，mac unix系统原因
sed -i '' "s/\"name\": \"@tencent/\"name\": \"@careteam/g" package.json 

# 执行发布公网npm操作

npm publish --userconfig ~/.npmrc-public-care --access=public
# 还原package.json
sed -i '' "s/\"name\": \"@careteam/\"name\": \"@tencent/g" package.json 

