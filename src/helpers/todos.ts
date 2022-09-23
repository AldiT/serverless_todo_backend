//import { TodosAccess } from './todosAcess'
//import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import { TodosAccess } from './todosAcess'
import { getS3UploadUrl } from './attachmentUtils'

const logger = createLogger("todosModule")

// TODO: Implement businessLogic
const todosAcess = new TodosAccess();

export interface AttachFileResponse {
    todo: TodoItem,
    uploadUrl: string
}


//GET
export async function getTodos(userId: string): Promise<Array<TodoItem>> {
    logger.info(`Getting all todos for user: ${userId}`)
    return todosAcess.getTodos(userId);
}

//POST
export async function createTodo(userId: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
    logger.info(`Creating todo for user: ${userId}`)
    const todoId: string = uuid.v4();

    return todosAcess.createTodo(userId, todoId, createTodoRequest);
}

//PATCH
export async function updateTodo(userId: string, todoId: string, updateTodoRequest: UpdateTodoRequest): Promise<TodoItem> {
    logger.info(`Updating todo: ${todoId}`)
    return todosAcess.updateTodo(userId, todoId, updateTodoRequest);
}

// DELETE
export async function deleteTodo(userId: string, todoId: string): Promise<TodoItem> {
    logger.info(`Deleting todo: ${todoId}`)
    return todosAcess.deleteTodo(userId, todoId);
}

// Does the todo exist or not?
export async function todoExists(userId: string, todoId: string): Promise<boolean> {
    logger.info(`Checking if the todo: ${todoId} exists for user ${userId}!`)
    return todosAcess.todoExists(userId, todoId);
}

export async function attachFileToTodo(userId: string, todoId: string): Promise<AttachFileResponse> {
    logger.info(`Adding the attachment url to the todo: ${todoId}`)
    const uploadUrl: string = await getS3UploadUrl(todoId);
    const updatedTodo: TodoItem = await todosAcess.attachFileToTodo(userId, todoId);

    const response: AttachFileResponse = {
        todo: updatedTodo,
        uploadUrl: uploadUrl
    }

    return response;
}