//import { TodosAccess } from './todosAcess'
//import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import { TodosAccess, AttachFileResponse } from './todosAcess'
import { loggers } from 'winston'


const logger = createLogger("todosModule")

// TODO: Implement businessLogic
const todosAcess = new TodosAccess();

//GET
export async function getTodos(userId: string): Promise<Array<TodoItem>> {
    logger.info("Getting all todos!")
    return todosAcess.getTodos(userId);
}

//POST
export async function createTodo(userId: string, name: string, dueDate: string): Promise<TodoItem> {
    logger.info("Creating the Todo!")
    const todoId: string = uuid.v4();

    return todosAcess.createTodo(userId, todoId, name, dueDate);
}

//PATCH
export async function updateTodo(userId: string, todoId: string, name: string, dueDate: string, done: boolean): Promise<TodoItem> {
    logger.info("Updating the Todo!")
    return todosAcess.updateTodo(userId, todoId, name, dueDate, done);
}

// DELETE
export async function deleteTodo(userId: string, todoId: string): Promise<TodoItem> {
    logger.info("Deleting the Todo!")
    return todosAcess.deleteTodo(userId, todoId);
}

// Does the todo exist or not?
export async function todoExists(userid: string, todoId: string): Promise<boolean> {
    logger.info("Checking if the todo exists for this user!")
    return todosAcess.todoExists(userid, todoId);
}

export async function attachFileToTodo(userId: string, todoId: string): Promise<AttachFileResponse> {
    logger.info("Attaching attachment url to the Todo!")
    return todosAcess.attachFileToTodo(userId, todoId);
}