import Joi from "joi";
import "dotenv/config";

const envVarsSchema = Joi.object()
  .keys({
    ENVIRONMENT: Joi.string()
      .valid("prod", "stage", "preprod", "test")
      .required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description("Mongo DB url"),
    BACKEND_OPEN_API_URL: Joi.string().required()
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.ENVIRONMENT,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.ENVIRONMENT === "test" ? "-test" : ""),
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  openApiUrl: envVars.BACKEND_OPEN_API_URL
};

export default config;
