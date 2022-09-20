import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getUserId } from '../utils'
import { deleteTodo, todoExists } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'
import { create } from 'domain'

const logger = createLogger("DeleteTodoHttp")

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId: string = event.pathParameters.todoId;
    const userId: string = getUserId(event);
    // TODO: Remove a TODO item by id
    
    try{

      const exists = await todoExists(userId, todoId);
      
      if (exists){
        await deleteTodo(userId, todoId);
        return {
          statusCode: 200,
          body: 'Deleted sucessfully!'
        }
      }

      return {
        statusCode: 404,
        body: 'Todo not found!'
      }
      

    }catch(e){
      console.log(e)
      logger.error(e)
      return {
        statusCode: 500,
        body: 'Error deleting Todo!'
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
