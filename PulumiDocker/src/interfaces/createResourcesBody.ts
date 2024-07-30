import { path } from "../interfaces";

export interface createApiGatewayRequestBody {
    stackName : string,
    ApiName : string,
    routes : path[],
    description : string,
    url : string,
    deploymentName : string,
    stageName : string,
    domainName: string
}