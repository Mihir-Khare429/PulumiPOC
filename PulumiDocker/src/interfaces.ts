import * as pulumi from "@pulumi/pulumi";

export interface ResourceMap {
    [key: string]: pulumi.Output<string>;
}

export interface path {
    name : string,
    httpMethod : string,
    pathParams ?: string[],
    requestModel ?: schemaType
}

export interface schemaType {title ?: string, properties : Object, required ?: string[], type : string, description ?: string,}