// Example Typesense service
import { Injectable } from '@nestjs/common';
import * as Typesense from 'typesense';

@Injectable()
export class TypesenseService {
  private client: Typesense.Client;

  constructor() {
    this.client = new Typesense.Client({
      nodes: [
        {
          host: process.env.TYPESENSE_HOST,
          port: parseInt(process.env.TYPESENSE_PORT),
          protocol: process.env.TYPESENSE_PROTOCOL,
        },
      ],
      apiKey: process.env.TYPESENSE_API_KEY,
      connectionTimeoutSeconds: 2,
    });
  }

  getClient(): Typesense.Client {
    return this.client;
  }

}