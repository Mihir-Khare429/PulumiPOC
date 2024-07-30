import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { ResourceMap, path, schemaType } from "./interfaces";
import { convertToAlphaNum, createKey } from './utils';
import { Method } from "@pulumi/aws/apigateway";
import * as crypto from "crypto";

export class ApiGateway {

    #ApiName : string
    #apiId !: pulumi.Output<string>
    // @ts-ignore
    apiDetail
    #rootResourceId !: pulumi.Output<string>
    #requestValidatorId !: pulumi.Output<string>
    #routes : path[]
    #description : string
    #deploymentId !: pulumi.Output<string>
    #deploymentName : string
    #stageName : string
    #domainName !: string
    #invokeUrl !: pulumi.Output<string>
    #stageNamePulumi !: pulumi.Output<string>
    #url : string
    static createdResourceMap: ResourceMap = {};
    static createdRequestModelMap : {[key :string] : string} = {}
    static createdChildResources : string[] = []
    #methodDependencyArray : pulumi.Output<Method>[] = []

    constructor(ApiName : string, routes : path[], description : string, url : string, deploymentName : string, stageName : string, domainName : string){
        this.#ApiName = ApiName,
        this.#routes = routes,
        this.#description = description
        this.#url = url
        this.#deploymentName = deploymentName
        this.#stageName = stageName
        this.#domainName = domainName
    }

    createApiGateway(){
       const api= new aws.apigateway.RestApi(this.#ApiName, { description: this.#description });

        this.#apiId = api.id
        this.#rootResourceId = api.rootResourceId
        
    }

    createRequestValidators(name : string, validateRequestBody: boolean, validateRequestParameters: boolean){
        const requestValidator = new aws.apigateway.RequestValidator(name, {
            restApi: this.#apiId,
            validateRequestBody: validateRequestBody,
            validateRequestParameters: validateRequestParameters,
        });

        this.#requestValidatorId = requestValidator.id
    }

    createResource = async (key: string, parentId: pulumi.Output<string> | undefined): Promise<pulumi.Output<string>> => {
        let name = key

        if((ApiGateway.createdChildResources).includes(key)){
            name =`${key}${parentId}`
        }

        const resource = new aws.apigateway.Resource(name, {
            restApi: this.#apiId,
            parentId: parentId || this.#rootResourceId,
            pathPart: key,
        });
    
        const resourceId = resource.id;
    
        return resourceId;
    };

    createModel = (name: string, schema : schemaType) => {
        const validName = convertToAlphaNum(name);
        const jsonSchema = {
            "$schema": "http://json-schema.org/draft-04/schema#",
            "title": schema.title,
            "type": "object",
            "properties": schema.properties,
            "required" : schema.required
        };
        new aws.apigateway.Model(validName, {
            restApi: this.#apiId,
            name :validName,
            description: "A JSON Schema",
            contentType: "application/json",
            schema: JSON.stringify(jsonSchema)
        });
    }

    createMethod =  async (methodType : string, resourceId : pulumi.Output<string>, name: string, pathParams: string[] | undefined, requestValidatorId : pulumi.Output<string> | undefined, requestModelName : string | undefined) : Promise<pulumi.Output<Method>> => {

        const requestParameters = pathParams !== undefined ? 
            { [`method.request.path.${pathParams[0]}`]: true } : 
            {};
        const model = requestModelName !== undefined && methodType !== "GET" ? {"application/json" : requestModelName} : {"application/json" : "Empty"}
    
        const method = await new aws.apigateway.Method(name, {
            restApi: this.#apiId,
            resourceId: resourceId,
            httpMethod: methodType,
            authorization: "NONE",
            requestParameters: requestParameters,
            requestValidatorId: methodType === "POST" ? requestValidatorId : undefined,
            requestModels: model
        });

        return pulumi.output(method);
    }

    createIntegration = async (resourceId : pulumi.Output<string>, method : pulumi.Output<string>, methodType : string, path : string, pathParams: string[] | undefined) => {

        const requestParameters = pathParams !== undefined ? 
            { [`integration.request.path.${pathParams[0]}`] :`method.request.path.${pathParams[0]}` } : 
            {};
    
        await new aws.apigateway.Integration(`${methodType}${path}`, {
            restApi: this.#apiId,
            resourceId: resourceId,
            httpMethod: method,
            integrationHttpMethod: methodType,
            type: "HTTP_PROXY",
            uri: `${this.#url}${path}`,
            requestParameters: requestParameters
        });
    }

    createDeploymnet = async () => {
        const deployment = await new aws.apigateway.Deployment(this.#deploymentName, {
            restApi: this.#apiId,
        },{
            dependsOn : this.#methodDependencyArray
        });
    
        this.#deploymentId = deployment.id

        const stage = new aws.apigateway.Stage(this.#stageName, {
            deployment: this.#deploymentId,
            restApi: this.#apiId,
            stageName: this.#stageName
        },{
            dependsOn : deployment
        });

        const domain = new aws.apigateway.DomainName("DomainApiGateway", {
            regionalCertificateArn: "arn:aws:acm:eu-west-1:710170054012:certificate/6cc8eba8-7855-4f72-9c6e-69ca5df6b57e",
            domainName: this.#domainName,
            endpointConfiguration : {
                types : "REGIONAL"
            }           
        },{
            dependsOn : stage
        });

        const basePathMapping = new aws.apigateway.BasePathMapping("basePathMapping", {
            restApi: this.#apiId,
            stageName: stage.stageName,
            domainName: domain.domainName,
        },{
            dependsOn : stage
        });
    
        new aws.route53.Record("TestRecordPulumi2", {
            name: domain.domainName,
            type: "A",
            zoneId: "Z1YKTWUGMTR0PH",
            aliases: [{
                evaluateTargetHealth: true,
                name: domain.regionalDomainName,
                zoneId: domain.regionalZoneId,
            }],
        },{
            dependsOn : domain
        });
        
        this.#invokeUrl = stage.invokeUrl
    }

    createRoutes(){
        this.createResources()
    }

    async createResources() {

        for (const path of this.#routes) {
            const splitPath: string[] = path.name.split('/').filter(part => part !== '');
    
            let parentId: pulumi.Output<string> | undefined;
    
            for (let idx = 0; idx < splitPath.length; idx++) {
                const split = splitPath[idx];
    
                if (idx === 0) {
                    if (ApiGateway.createdResourceMap[split] === undefined) {
                        const resource = await this.createResource(split, undefined);
                        ApiGateway.createdResourceMap[split] = resource;
                        parentId = resource;
                    } else {
                        parentId = ApiGateway.createdResourceMap[split];
                    }
                } else {
                    const key = createKey(idx, splitPath);
                    if (ApiGateway.createdResourceMap[key] === undefined) {
                        const resource = await this.createResource(split, parentId);
                        ApiGateway.createdResourceMap[key] = resource;
                        ApiGateway.createdChildResources.push(split)
                        parentId = resource;
                    } else {
                        parentId = ApiGateway.createdResourceMap[key];
                    }
                }
            }
            if (path?.requestModel) {
                this.createModel(`${splitPath[splitPath.length - 1]}${path.httpMethod}`, path.requestModel);
                ApiGateway.createdRequestModelMap[splitPath[splitPath.length - 1]] = convertToAlphaNum(`${splitPath[splitPath.length - 1]}${path.httpMethod}`);
            }
            let method: pulumi.Output<Method> | undefined;
            method = await this.createMethod(path.httpMethod, ApiGateway.createdResourceMap[createKey(splitPath.length-1, splitPath)], `${path.name}${path.httpMethod}`, path?.pathParams, this.#requestValidatorId, ApiGateway.createdRequestModelMap[splitPath[splitPath.length - 1]]);
            this.#methodDependencyArray.push(method)
            await this.createIntegration(ApiGateway.createdResourceMap[createKey(splitPath.length-1, splitPath)], method.httpMethod, path.httpMethod, path.name, path?.pathParams);
        }

        await Promise.all(this.#methodDependencyArray)

        this.createDeploymnet()
    }
}