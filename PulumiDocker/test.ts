var exec = require('child_process').exec;
var cmd = 'pulumi stack init test2';
const output = []

exec(cmd, function(_error: any, stdout: any, _stderr: any) {
  console.log(stdout)
});