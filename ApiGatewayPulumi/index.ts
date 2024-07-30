import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { path, ResourceMap } from './src/interfaces'

const paths : path[] = [
    {
        name: "/v1/healthcheck",
        httpMethod: "GET"
    },
    {
        name: "/v1/accountPricingArchitecture/{accountId}",
        httpMethod: "GET",
        pathParams: ["accountId"]
    },
    {
        name: "/v1/accountPricingArchitecture/{accountId}",
        httpMethod: "PUT",
        pathParams: ["accountId"]
    },
    {
        name: "/v1/defaultValues",
        httpMethod: "POST",
        requestModel: {
            "description": "Default values request",
            "type": "object",
            "title" : "Default Values model",
            "properties": {
              "accountId": {
                "type": "string"
              },
              "market": {
                "type": "string"
              },
              "attributeKey": {
                "type": "string"
              },
              "attributeValues": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            },
            "required" : ["accountId"]
        }
    },
    {
        name: "/v1/defaultValues",
        httpMethod: "GET"
    },
    {
        name: "/v1/availableInputs/{sku}",
        httpMethod: "GET",
        pathParams: ["sku"]
    },
    {
        name: "/v1/requiredInputs/{sku}",
        httpMethod: "GET",
        pathParams: ["sku"]
    },
    {
        name: "/v1/requiredInputs",
        httpMethod: "POST"
    },
    {
        name: "/v1/requiredInputsV2",
        httpMethod: "POST"
    },
    {
        name: "/v1/requiredInputsV1",
        httpMethod: "POST"
    },
    {
        name: "/v1/priceList",
        httpMethod: "POST"
    },
    {
        name: "/v1/transactionalPrice/verbose",
        httpMethod: "POST"
    },
    {
        name: "/v1/productCost",
        httpMethod: "POST"
    },
    {
        name: "/v1/priceEvaluation:bulkEvaluate",
        httpMethod: "POST"
    }
]



const createdResourceMap: ResourceMap = {};
const createdRequestModelMap : {[key :string] : string} = {}

const myDemoAPI = new aws.apigateway.RestApi("myDemoAPI", { description: "This is my API for demonstration purposes" });

const createResource = async (key: string, parentId: pulumi.Output<string> | undefined): Promise<pulumi.Output<string>> => {

    const myDemoResource = new aws.apigateway.Resource(key, {
        restApi: myDemoAPI.id,
        parentId: parentId || myDemoAPI.rootResourceId,
        pathPart: key,
    });

    const resourceId = myDemoResource.id;

    return resourceId;
};

const createMethod = (methodType : string, resourceId : pulumi.Output<string>, name: string, pathParams: string[] | undefined, requestValidatorId : pulumi.Output<string> | undefined, requestModelName : string | undefined) => {

    const requestParameters = pathParams !== undefined ? 
        { [`method.request.path.${pathParams[0]}`]: true } : 
        {};
    const model = requestModelName !== undefined ? {"application/json" : requestModelName} : {"application/json" : "Empty"}

    const method = new aws.apigateway.Method(name, {
        restApi: myDemoAPI.id,
        resourceId: resourceId,
        httpMethod: methodType,
        authorization: "NONE",
        requestParameters: requestParameters,
        requestValidatorId: methodType === "POST" ? requestValidatorId : undefined,
        requestModels: model
    });
}

const createDeploymnet = async (deploymentName : string) : Promise<pulumi.Output<string>> => {
    const deployment = new aws.apigateway.Deployment(deploymentName, {
        restApi: myDemoAPI.id
    });

    const deploymentId = deployment.id

    return deploymentId
}

const createStage = async (stageName : string, deploymentId: pulumi.Output<string>) : Promise<pulumi.Output<string>> => {
    const exampleStage = new aws.apigateway.Stage(stageName, {
        deployment: deploymentId,
        restApi: myDemoAPI.id,
        stageName: "Dev1",
    });

    const invokeUrl = exampleStage.invokeUrl

    return invokeUrl
}

const createIntegration = (resourceId : pulumi.Output<string>, methodType : string, path : string, pathParams: string[] | undefined) => {

    const requestParameters = pathParams !== undefined ? 
        { [`integration.request.path.${pathParams[0]}`] :`method.request.path.${pathParams[0]}` } : 
        {};

    new aws.apigateway.Integration(`${methodType}${path}`, {
        restApi: myDemoAPI.id,
        resourceId: resourceId,
        httpMethod: methodType,
        integrationHttpMethod: methodType,
        type: "HTTP_PROXY",
        uri: `https://tmp-priceintegration.financialflows.cimpress.io${path}`,
        requestParameters: requestParameters
    });
}

const settingUpApiGateway = () => {
    
    const exampleDomainName = new aws.apigateway.DomainName("TestDomain", {
        certificateArn: "arn:aws:acm:eu-west-1:710170054012:certificate/92abb729-f849-42ef-ba37-dae645d90938",
        domainName: "api.myDemoApi.prices.cimpress.io",
    });

    const exampleRecord = new aws.route53.Record("TestRecordPulumi", {
        name: exampleDomainName.domainName,
        type: "A",
        zoneId: "Z07395092HG6GW3VFW5QC",
        aliases: [{
            evaluateTargetHealth: true,
            name: exampleDomainName.cloudfrontDomainName,
            zoneId: exampleDomainName.cloudfrontZoneId,
        }],
    });
}

const createRequestValidators = (name : string) => {
    const example = new aws.apigateway.RequestValidator(name, {
        restApi: myDemoAPI.id,
        validateRequestBody: true,
        validateRequestParameters: true,
    });

    const resourceId = example.id;

    return resourceId;
}

const createModel = (name: string, schema : {properties : Object, required ?: string[]}) => {
    const jsonSchema = {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "title": "ExampleModel",
        "type": "object",
        "properties": schema.properties,
        "required" : schema?.required
    };
    new aws.apigateway.Model("TestModel", {
        restApi: myDemoAPI.id,
        name :name,
        description: "A JSON Schema",
        contentType: "application/json",
        schema: JSON.stringify(jsonSchema)
    });
}

const traversePaths = async (paths: path[]): Promise<void> => {

    let requestValidatorId : pulumi.Output<string> | undefined;
    const requestValidator = await createRequestValidators("RequestBodyAndParamsValidator")
    requestValidatorId = requestValidator

    for (const path of paths) {
        const splitPath: string[] = path.name.split('/').filter(part => part !== '');

        let parentId: pulumi.Output<string> | undefined;

        for (let idx = 0; idx < splitPath.length; idx++) {
            const split = splitPath[idx];

            if (idx === 0) {
                if (createdResourceMap[split] === undefined) {
                    const resource = await createResource(split, undefined);
                    createdResourceMap[split] = resource;
                    parentId = resource;
                } else {
                    parentId = createdResourceMap[split];
                }
            } else {
                if (createdResourceMap[split] === undefined) {
                    const resource = await createResource(split, parentId);
                    createdResourceMap[split] = resource;
                    parentId = resource;
                } else {
                    parentId = createdResourceMap[split];
                }
            }
        }
        if(path?.requestModel){
            createModel(`${splitPath[splitPath.length - 1]}${path.httpMethod}`,path.requestModel)
            createdRequestModelMap[splitPath[splitPath.length - 1]] = `${splitPath[splitPath.length - 1]}${path.httpMethod}`
        }

        createMethod(path.httpMethod, createdResourceMap[splitPath[splitPath.length - 1]], `${path.name}${path.httpMethod}`,path?.pathParams, requestValidatorId, createdRequestModelMap[splitPath[splitPath.length - 1]])
        createIntegration(createdResourceMap[splitPath[splitPath.length - 1]], path.httpMethod, path.name, path?.pathParams)
        
    }

    // let deploymentId: pulumi.Output<string> | undefined;
    // let invokeUrl: pulumi.Output<string> | undefined;
    // const deployment = await createDeploymnet(`DevApiDeloyment${Math.random()*10000}`)
    // deploymentId = deployment
    // const stage = await createStage(`DevStage${Math.random()*10000}`, deploymentId)
    // invokeUrl = stage
    // console.log("Invoke URL", invokeUrl)
    // settingUpApiGateway()
};

traversePaths(paths).then(() => {
    console.log("Resource map:");
});