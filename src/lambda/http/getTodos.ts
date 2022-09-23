import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../utils'
import { getTodos } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'

//import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
//import { getUserId } from '../utils';

const logger = createLogger('GetTodoHttp');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Processing get Todos request: \n${event}`);
    try{
      const userId: string = getUserId(event);
      const todos = await getTodos(userId);

    return {
        statusCode: 200,
        body: JSON.stringify({
          items: todos
        })
      }

    }catch(e){
      console.log(e)
      logger.error(e)
      return {
        statusCode: 500,
        body: JSON.stringify({
            message: 'Error getting Todos!'
          })
        }
    }
})

handler.use(
  cors({
    credentials: true
  })
)
