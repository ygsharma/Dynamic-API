import { Response } from "express";

/** 
 * Generic Normal Response function to be used across the app, to send 
 * response to the client Ex: (Web, Mobile)  
 * @param res Object, Express Response 
 * @param statusCode Number, HTTP Status Code Range (200 - 400)
 * @param message String, Message to be sent to front end  
 * @param data Object | Array, Response payload to be sent to front end
 */
export const responseNormal = (res: Response, statusCode: number, message: string, data: any) => {
  const time = new Date();
  res.status(statusCode).json({ message, data, time })
};

/** 
 *  Generic error response function, commanly used in try catch (catch block)
 *  It handle error gracefully, and error response to client  
 * @param res Object, Express Response 
 * @param statusCode Number, HTTP Status Code Range (500 - 599)
 * @param message String, Message to be sent to front end 
 * @param errorObj Object, Node Error instance object 
 */
export const errResponse = (res: Response, statusCode: number, message: string, errorObj: any) => {
  const time = new Date();
  res.status(statusCode).json({ message, data: errorObj, time })
};