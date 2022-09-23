import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getUserId } from '../utils'
import { attachFileToTodo, todoExists } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'
import { AttachFileResponse } from '../../helpers/todosAcess'

const logger = createLogger("GenerateAttachmentUrlTood")

//import { createAttachmentPresignedUrl } from '../../businessLogic/todos'
//import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    try{
      const todoId = event.pathParameters.todoId
      const userId = getUserId(event);

      const exist: boolean = await todoExists(userId, todoId);

      if (!exist){
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'The Todo with given Id does not exist!'
          })
        }
      }

      const response: AttachFileResponse = await attachFileToTodo(userId, todoId);


      return {
        statusCode: 200,
        body: JSON.stringify({
          item: response
        })
      }
    }catch(e){
      console.log(e);
      logger.error(e);
      
      return {
        statusCode: 500,
        body: JSON.stringify({
          item: 'Error happened'
        })
      }
    }
    
})

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
