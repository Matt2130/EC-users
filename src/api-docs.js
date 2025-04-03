import swaggerJSDoc from "swagger-jsdoc";

//Config contract swagger
const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0" ,
        info: {
            version: "1.0.0",
            title: "Docu API",
            description: "API Documentation for use", 
            servers: ["http://localhost"],
            schemes: 
            - "https"
            - "http"
        }
    },
    basePath: "/",
    apis: ["src/routes/*.js"]
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
export default swaggerSpec;