import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { bool } from 'aws-sdk/clients/signer'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic


export interface AttachFileResponse {
    todo: TodoItem,
    uploadUrl: string
}


export class TodosAccess {

    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable: string = process.env.TODOS_TABLE,
        private readonly todosCreatedAtIndex: string = process.env.TODOS_CREATED_AT_INDEX,
        private readonly attachmentsBucket: string = process.env.ATTACHMENT_S3_BUCKET
    ){

    }

    //GET TODOS
    async getTodos(userId: string): Promise<Array<TodoItem | null>> {
        logger.info(`Reading all the todos for user: ${userId}`);

        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todosCreatedAtIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();

        const todos = result.Items;

        return todos as Array<TodoItem>;
    }

    //POST TODOs
    async createTodo(userId: string, todoId: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem>{
        logger.info(`Adding a new todo for user: ${userId}`);

        const newTodo: TodoItem = {
            todoId: todoId,
            userId: userId,
            createdAt: new Date().toISOString(),
            name: createTodoRequest.name,
            dueDate: createTodoRequest.dueDate,
            done: false
        }

        await this.docClient.put({
            TableName: this.todosTable,
            Item: newTodo
        }).promise();

        return newTodo;
    }

    //PATCH TODOs
    async updateTodo(userId: string, todoId: string, updateTodoRequest: UpdateTodoRequest): Promise<TodoItem>{
        logger.info(`Updating todo with id: ${todoId}`);

        // Update the item in the table
        const result = await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId: todoId,
                userId: userId
            },
            UpdateExpression: 'set #n = :n, dueDate = :dueDate, done = :done',
            ExpressionAttributeNames: {
                '#n': 'name'
            },
            ExpressionAttributeValues: {
                ':dueDate': updateTodoRequest.dueDate,
                ':done': updateTodoRequest.done,
                ':n': updateTodoRequest.name
            },
            ReturnValues: 'ALL_NEW'
        }).promise();

        const newTodo: TodoItem = result.Attributes as TodoItem;

        return newTodo;
    }

    async attachFileToTodo(userId: string, todoId: string): Promise<TodoItem> {
        logger.info(`Attaching file to todo: ${todoId}`);

        const result = await this.docClient.update({
            TableName: this.todosTable,
            Key:{
                todoId: todoId,
                userId: userId
            },
            UpdateExpression: 'set #url = :url',
            ExpressionAttributeNames: {
                '#url': 'attachmentUrl'
            },
            ExpressionAttributeValues: {
                ':url': `https://${this.attachmentsBucket}.s3.amazonaws.com/${todoId}`
            },
            ReturnValues: 'ALL_NEW'
        }).promise();
        

        const newTodo: TodoItem = result.Attributes as TodoItem;

        return newTodo;
    }

    //DELETE TODOs
    async deleteTodo(userId: string, todoId: string): Promise<TodoItem> {
        logger.info(`Deleting the TODO with id: ${todoId}`);

        const result = await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId: todoId,
                userId: userId
            },
            ReturnValues: 'ALL_OLD'
        }).promise()

        const deletedTodo: TodoItem = result.Attributes as TodoItem;

        return deletedTodo;
    }



    async todoExists(userId: string, todoId: string): Promise<boolean>{
        logger.info(`Checking if TODO exists, todoId: ${todoId}`);

        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId AND todoId = :todoId',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':todoId': todoId
            }
        }).promise();

        
        return !!result.Count;
    }
}