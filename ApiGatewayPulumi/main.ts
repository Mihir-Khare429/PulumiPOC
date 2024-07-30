import { ApiGateway } from "./src/apiGateway";
import { path } from "./src/interfaces";

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
        httpMethod: "POST",
        requestModel :{
            "description" :  "Gets the required inputs for the given SKU, buyer and seller. (for Cim-Commerce)",
            "title" : "The request to get the required inputs.",
            "type": "object",
            "required": [
              "mcpSku",
              "buyer",
              "seller"
            ],
            "properties": {
              "mcpSku": {
                "type": "string",
                "example": "CIM-12345"
              },
              "seller": {
                "type": "object",
                "properties": {
                  "sellerId": {
                    "type": "string",
                    "example": "hjh8nrhpqx"
                  },
                  "sellerType": {
                    "type": "string",
                    "example": "fulfillers"
                  }
                }
              },
              "buyer": {
                "type": "object",
                "properties": {
                  "buyerId": {
                    "type": "string",
                    "example": "internal-test-merchant"
                  },
                  "buyerType": {
                    "type": "string",
                    "example": "merchants"
                  }
                }
              }
            }
          }
    },
    {
        name: "/v1/requiredInputsV2",
        httpMethod: "POST",
        requestModel: {
            "type": "object",
            "required": [
              "productId",
              "configurations"
            ],
            "properties": {
              "productId": {
                "type": "string",
                "example": "CIM-GT7Y2NA3"
              },
              "priceConfigurations": {
                "type": "array",
                "items": {
                    "description": "The price configuration object",
                    "type": "object",
                    "required": [
                      "seller",
                      "priceType",
                      "resourceType"
                    ],
                    "properties": {
                      "buyer": {
                        "type": "string",
                        "example": "GFUVnTT4mCDeVNGTb3cZe",
                        "description": "The buyer. Only applicable if the price type is \"transferPrice\"."
                      },
                      "seller": {
                        "type": "string",
                        "example": "g2Ez5VaoZWoqU22XqPjTLU",
                        "description": "The id of the account that these resources belong to."
                      },
                      "priceType": {
                        "type": "string",
                        "example": "transferPrice",
                        "description": "The type of price to get the required inputs for."
                      },
                      "resourceType": {
                        "type": "string",
                        "example": "product",
                        "description": "The type of resource to get the required inputs for."
                      },
                      "effectiveDate": {
                        "type": "string",
                        "example": "2020-11-02T07:06:07.3465709+00:00",
                        "description": "The date to find the required inputs for.\nWhat inputs are required can change depending on what price configuration is currently active."
                      }
                    }
                },
              }
            }
        }
    },
    {
        name: "/v1/requiredInputsV1",
        httpMethod: "POST",
        requestModel: {
            "description": "The request to get the required inputs.",
            "title" : "The request to get the required inputs.",
            "type": "object",
            "required": [
              "sku",
              "priceModels"
            ],
            "properties": {
              "sku": {
                "type": "string",
                "description": "Sku",
                "example": "CIM-CTU6VT07"
              },
              "priceModels": {
                "type": "array",
                "description": "List of price Models",
                "items": {
                    "description": "The request object for price Model",
                    "type": "object",
                    "required": [
                      "priceModelId",
                      "priceModelRevision"
                    ],
                    "properties": {
                      "priceModelId": {
                        "description": "Price Model Id",
                        "type": "string",
                        "example": "ddf166bd-88c7-427b-a7cd-020992f65255"
                      },
                      "priceModelRevision": {
                        "description": "Price Model Revision",
                        "type": "number",
                        "example": 1
                      }
                    }
                }
              }
            }
          }
    },
    {
        name: "/v1/priceList",
        httpMethod: "POST",
        requestModel: {
            "title" :"A price list request object.",
            "description" :"A price list request object.",
            "required": [
              "seller",
              "buyer",
              "mcpSku"
            ],
            "type": "object",
            "properties": {
              "buyer": {
                "type": "object",
                "properties": {
                  "buyerType": {
                    "type": "string"
                  },
                  "buyerId": {
                    "type": "string"
                  }
                }
              },
              "seller": {
                "type": "object",
                "properties": {
                  "sellerType": {
                    "type": "string"
                  },
                  "sellerId": {
                    "type": "string"
                  }
                }
              },
              "mcpSku": {
                "type": "string"
              },
              "attributeSelections": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "class": {
                      "type": "string"
                    },
                    "attributeKey": {
                      "type": "string"
                    },
                    "attributeValue": {
                      "type": "string"
                    }
                  }
                }
              },
              "startingQuantity": {
                "format": "int32",
                "type": "integer"
              },
              "endingQuantity": {
                "format": "int32",
                "type": "integer"
              },
              "increment": {
                "format": "int32",
                "type": "integer"
              },
              "specifiedQuantities": {
                "type": "array",
                "items": {
                  "format": "int32",
                  "type": "integer"
                }
              }
            }
        }
    },
    {
        name: "/v1/transactionalPrice/verbose",
        httpMethod: "POST",
        requestModel: {
            "description": "The transactional price request object.",
            "title": "The transactional price request object.",
            "required": [
                "seller",
                "buyer",
                "mcpSku"
              ],
            "type": "object",
            "properties": {
              "buyer": {
                "type": "object",
                "properties": {
                  "buyerType": {
                    "type": "string"
                  },
                  "buyerId": {
                    "type": "string"
                  }
                }
              },
              "seller": {
                "type": "object",
                "properties": {
                  "sellerType": {
                    "type": "string"
                  },
                  "sellerId": {
                    "type": "string"
                  }
                }
              },
              "mcpSku": {
                "type": "string"
              },
              "attributeSelections": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "class": {
                      "type": "string"
                    },
                    "attributeKey": {
                      "type": "string"
                    },
                    "attributeValue": {
                      "type": "string"
                    }
                  }
                }
              }
            }
        }
    },
    {
        name: "/v1/productCost",
        httpMethod: "POST",
        requestModel: {
          "description": "Product cost request",
          "title": "Product cost request",
          "type": "object",
          "properties": {
            "accountId": {
              "type": "string"
            },
            "productId": {
              "type": "string"
            },
            "userSelections": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "attributeKey": {
                    "type": "string"
                  },
                  "attributeValue": {
                    "type": "string"
                  }
                }
              }
            },
            "showMultipleSellers": {
              "type": "boolean"
            },
            "quantities": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          }
        }
    },
    {
        name: "/v1/priceEvaluation:bulkEvaluate",
        httpMethod: "POST",
        requestModel : {
          "description": "Bulk evaluate wrapper request",
          "title": "Bulk evaluate wrapper request",
          "type": "object",
          "properties": {
            "iterations": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string"
                  },
                  "seller": {
                    "type": "string"
                  },
                  "buyer": {
                    "type": "string",
                    "format": "nullable"
                  },
                  "priceDomain": {
                    "type": "string"
                  },
                  "priceType": {
                    "type": "string"
                  },
                  "resourceId": {
                    "type": "string"
                  },
                  "resourceType": {
                    "type": "string"
                  },
                  "_links": {
                    "type": "object",
                    "properties": {
                      "self": {
                        "type": "object",
                        "properties": {
                          "href": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  },
                  "iterationKey": {
                    "type": "string"
                  },
                  "evaluationDate": {
                    "type": "string"
                  }
                }
              }
            },
            "resourceGroups": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "resourceGroupKey": {
                    "type": "string"
                  },
                  "resources": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "resourceKey": {
                          "type": "string"
                        },
                        "resourceId": {
                          "type": "string"
                        },
                        "resourceType": {
                          "type": "string"
                        },
                        "inputSelections": {
                          "type": "array",
                          "items": {
                            "type": "object",
                            "properties": {
                              "scope": {
                                "type": "string"
                              },
                              "name": {
                                "type": "string"
                              },
                              "value": {
                                "type": "string"
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
    }
]

const api = new ApiGateway("priceIntegration-stg", paths, "Api Gateway layer for price integration service stage environment","https://stg-priceintegration.financialflows.cimpress.io");

api.createApiGateway();
api.createRequestValidators("PriceIntegrationStg", true, true);
api.createRoutes();
api.createDeploymnet("stgDeployment-1")
api.createStage("stgv1")
api.integrateWithRoute53("api.stgpriceintegration.prices.cimpress.io")