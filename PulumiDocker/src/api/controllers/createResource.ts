import { Request, Response } from "express";
import { createApiGatewayResources, createStackCliCommand, setupApiGateway } from "../../utils/pulumi";
import { createApiGatewayRequestBody } from "../../interfaces/createResourcesBody";

const currentStack: string[] = ["test1", "dev"];

const fs = require('fs');

function writeArrayToFile(array: string[], filePath: string) {
    // Convert the array elements to a string with each element on a new line
    const arrayString = array.join('\n');

    // Write the string to the file
    fs.writeFileSync(filePath, arrayString, 'utf-8');
    
    console.log(`Array has been written to ${filePath}`);
}


const createStack = (name: string): void => {

    if (currentStack.includes(name)) {
        throw new Error("Stack name already exists!");
    }
    currentStack.push(name);
};

export const createApiGateway = async (req: Request, res: Response) => {
    try {
        const {ApiName, stackName, stageName, deploymentName, description, domainName, url, routes} : createApiGatewayRequestBody = req.body;
        
        if (!stackName) {
            throw new Error("Stack name is required!");
        }

        createStack(stackName);

        writeArrayToFile(currentStack, 'output.txt')

        await createStackCliCommand(stackName)

        await createApiGatewayResources();

        await setupApiGateway(ApiName, routes, description, url, deploymentName, stageName, domainName);

        res.status(200).send("Stack created successfully!");

    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};