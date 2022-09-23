import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { getUserId } from '../utils';
import { createTodo } from '../../helpers/todos';
import { TodoItem } from '../../models/TodoItem';
import { createLogger } from '../../utils/logger';


const logger = createLogger('CreateTodoHttp');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Processing create Todo request: \n${event}`);
    
    try{
      const newTodoRequest: CreateTodoRequest = JSON.parse(event.body);
      const userId: string = getUserId(event);

      const newTodo: TodoItem = await createTodo(userId, newTodoRequest);

      return {
      statusCode: 200,
      body: JSON.stringify(newTodo)
      }
    }catch(e){
      logger.error(e);

      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Error while trying to create todo!'
        })
      }
    }

    
  })

handler.use(
  cors({
    credentials: true
  })
)
