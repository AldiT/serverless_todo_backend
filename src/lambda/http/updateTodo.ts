import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

//import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { updateTodo, todoExists } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'
import { TodoItem } from '../../models/TodoItem'

const logger = createLogger("UpdateTodoHttp")

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoId = event.pathParameters.todoId
      const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
      const userId: string = getUserId(event);

      const exists = await todoExists(userId, todoId);

      if (exists){
        const newTodo: TodoItem = await updateTodo(userId, todoId, updatedTodo.name, updatedTodo.dueDate, updatedTodo.done);

        return {
          statusCode: 200,
          body: JSON.stringify({
            item: newTodo
          })
        }

      }else{
        
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: 'Todo with given Id not found!'
          })
        }
      }

    }catch(e){
      console.log(e)
      logger.error(e)
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Error happened while trying to update todo!'
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
