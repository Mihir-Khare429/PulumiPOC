import { ApiGateway } from "../apiGateway";
import { path } from "../interfaces";

var exec = require('child_process').exec;

const execCommand = async (cmd : string) => {
    let acknowledge: boolean = false

    await exec(cmd, function(_error: any, stdout: any, _stderr: any) {
        
        if(stdout){
            console.log("Std out",stdout)
            acknowledge = true
        }
        if(_error){
            console.log(_error)
        }
        if(_stderr){
            console.log(_stderr)
        }
    });

    return acknowledge
}

export const createStackCliCommand = async (stackName : string) => {
    const createCommand = `pulumi stack init ${stackName}`
    const execute = await execCommand(createCommand)

    return execute;
}

export const createApiGatewayResources = async () => {
    const createCommand = 'pulumi up --skip-preview'
    const execute = await execCommand(createCommand)

    return execute;
}

export const setupApiGateway = async (ApiName : string, routes : path[], description : string, url : string, deploymentName : string, stageName : string, domainName : string) => {
    const api = new ApiGateway(ApiName, routes, description, url, deploymentName, stageName, domainName);
 
    await api.createApiGateway();
    await api.createRequestValidators("PriceIntegrationTemp", true, true);
    await api.createRoutes();
}