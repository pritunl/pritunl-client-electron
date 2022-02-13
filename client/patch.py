data = ''
for line in open('./node_modules/superagent/package.json', 'r'):
    if '"./src/node/index.js": "./src/client.js"' in line:
        continue
    elif '"./lib/node/index.js": "./lib/client.js"' in line:
        continue
    elif '"semver": false' in line:
        continue
    elif '"./test/support/server.js": "./test/support/blank.js",' in line:
        line = line.replace('blank.js",', 'blank.js"')
    data += line

file = open('./node_modules/superagent/package.json', 'w')
file.write(data)
file.close()
