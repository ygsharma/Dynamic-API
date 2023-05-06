import Joi from "joi";
import { join } from "path";

export const apiGenerate = {
  body: Joi.object().keys({
    data: Joi.object().keys({
      name: Joi.string().required(),
      children: Joi.array().items(),
      id: Joi.number().required(),
      description: Joi.string(),
      type: Joi.string(),
      version: Joi.string(),
      label: Joi.array().items(Joi.string()),
    }),
  }),
};
