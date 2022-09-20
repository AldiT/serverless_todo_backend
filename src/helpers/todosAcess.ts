import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { bool } from 'aws-sdk/clients/signer'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {

    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly s3: AWS.S3 = new AWS.S3({signatureVersion: 'v4'}),
        private readonly todosTable: string = process.env.TODOS_TABLE,
        private readonly todosCreatedAtIndex: string = process.env.TODOS_CREATED_AT_INDEX,
        private readonly signedUrlExpiration: number = Number(process.env.SIGNED_URL_EXPIRATION),
        private readonly attachmentsBucket: string = process.env.ATTACHMENT_S3_BUCKET,
        private readonly userIdIndex: string = process.env.TODOS_USER_ID_INDEX
    ){

    }

    //GET TODOS
    async getTodos(userId: string): Promise<Array<TodoItem | null>> {
        logger.info(`Reading all the todos for user: ${userId}`);

        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();

        const todos = result.Items;

        return todos as Array<TodoItem>;
    }

    //POST TODOs
    async createTodo(userId: string, todoId: string, name: string, dueDate: string): Promise<TodoItem>{
        logger.info(`Adding a new todo for user: ${userId}`);

        const newTodo: TodoItem = {
            todoId: todoId,
            userId: userId,
            createdAt: new Date().toISOString(),
            name: name,
            dueDate: dueDate,
            done: false
        }

        await this.docClient.put({
            TableName: this.todosTable,
            Item: newTodo
        }).promise();

        return newTodo;
    }

    //PATCH TODOs
    async updateTodo(userId: string, todoId: string, name: string, dueDate: string, done: boolean): Promise<void>{
        logger.info(`Updating todo with name: ${name}`);

        // Update the item in the table
        await this.docClient.update({
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
                ':dueDate': dueDate,
                ':done': done,
                ':n': name
            }
        }).promise();


        
    }

    //DELETE TODOs
    async deleteTodo(userId: string, todoId: string): Promise<void> {
        logger.info(`Deleting the TODO with id: ${todoId}`);

        await this.docClient.delete({
            TableName: todoId,
            Key: {
                todoId: todoId,
                userId: userId
            }
        }).promise()

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

    async getS3UploadUrl(todoId: string): Promise<string> {
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.attachmentsBucket,
            Key: todoId,
            Expires: this.signedUrlExpiration
        });
    }
}