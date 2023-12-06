---
author: Chris Gradwohl
date: 2023-12-05T16:53:53.226Z
title: AWS Serverless Landscape
tags:
  - aws
  - serverless
description: A brief overview of the AWS serverless landscape.
---
When I first started working with serverless offerings from AWS, I was coming from a traditional infrastructure background using services like EC2, Kubernetes, and RDS. I immediately saw the value in what serverless had to offer but the paradigm shift to serverless often felt more like a maze than a straightforward path.

In this guide, I distill the essence of what I've learned, transforming years of trial and error into straightforward insights. Whether you're stuck getting started, puzzled by service selection, or simply looking for a better understanding of what AWS serverless is, this series of blogs aims to help build a better understanding of building with AWS Serverless.

This is the overview I wish I had when I started building with AWS Serverless. I think once you get a grasp of these concepts you can start to leverage Serverless and build solutions quickly. I hope it can help someone get more comfortable and excited about building on AWS and most importantly, ship more software solutions out to the world.

In this first post, I want to set the stage a bit and provide some context about AWS and its Serverless offerings.

First off I think the term “serverless” is weird, but I am not going to waste time trying to define what is serverless and what isn’t. Instead, just know that I view any managed infrastructure service as “serverless”. Even if it's partially managed, it's still “serverless” to me. 

To me, there are 9 essential AWS Serverless services. Yes, many other services are considered “serverless” or managed and all of them can be useful. But these are the essential ones in the AWS domain that I think you should explore first. With these tools, you can create a solution for 90% of use cases.

![AWS Serverless Services.](../images/aws-essential-serverless-services.png)

Here is a brief overview of each service.

## API Gateway

- Handles up to 10,000 RPS. API Gateway invokes Lambda synchronously.
- directly maps an HTTP endpoint like `/my-endpoint` to a Lambda function
- no real retry or error handling

## Kinesis, SQS, Event Bridge

- Event broker services. Producing services writing records into an event broker and Consuming services either poll them or receive them asynchronously depending on the broker.
- Kinesis handles 400kb payloads usually called “records” or “events” and is very low latency if configured properly. Lambda polls Kinesis synchronously.
- SQS handles 256kb payloads usually called “messages” or “events” and is very low latency. Lambda polls SQS synchronously.
- EventBridge handles 256kb payloads called “events” and has much higher latency compared to other options in this list. Event Bridge invokes Lambda asynchronously.

## DynamoDB, S3

- Data storage services.
- Dynamo stores up to 400kb payloads called “items” and has very low latency but requires careful data modeling skills. It can also be used as an event source where up to two Lambda can poll the Dynamo DB stream synchronously.
- S3 stores up to 5 TiB payloads called “objects” and can now be as low latency as you want depending on how much you want to pay for it. It can also be used as an event source where Lambda is invoked by S3 asynchronously.
- These two services can be used together in tandem to create interesting data access solutions.

## Open Search

- Search and Monitoring Service.
- Open Search can handle up to 2GB payloads called “documents”. These documents are indexed by the service and can be used for nuanced data access patterns not easily supported by Dynamo DB or S3.

## Cloud Watch

- Monitoring service.
- Cloud Watch provides default and custom observability metrics, logging, and tracing for your solutions.

There are of course significant downsides to using serverless, which we will explore in a later post, but there are a lot of benefits as well. 

***The whole point of AWS Serverless is to rapidly build products and services with leverage.*** So when building and growing a new product or service that has zero users, serverless is often a great fit. Furthermore, these services provide a standard tool belt for you to easily scale your solutions once they start getting traffic (again, this comes with trade-offs that we will explore later).

In the next post, we will explore infrastructure as code and the many options and frameworks that exist.
