//import { TodosAccess } from './todosAcess'
//import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import { TodosAccess } from './todosAcess'
import { bool } from 'aws-sdk/clients/signer'

// TODO: Implement businessLogic
const todosAcess = new TodosAccess();

//GET
export async function getTodos(userId: string): Promise<Array<TodoItem>> {
    return todosAcess.getTodos(userId);
}

//POST
export async function createTodo(userId: string, name: string, dueDate: string): Promise<TodoItem> {

    const todoId: string = uuid.v4();

    return todosAcess.createTodo(userId, todoId, name, dueDate);
}

//PATCH
export async function updateTodo(userId: string, todoId: string, name: string, dueDate: string, done: boolean): Promise<void> {
    todosAcess.updateTodo(userId, todoId, name, dueDate, done);
}

// DELETE
export async function deleteTodo(userId: string, todoId: string): Promise<void> {
    todosAcess.deleteTodo(userId, todoId);
}

// Does the todo exist or not?
export async function todoExists(userid: string, todoId: string): Promise<boolean> {
    return todosAcess.todoExists(userid, todoId);
}