---
author: Chris Gradwohl
date: 2024-01-25T16:53:53.226Z
title: Containers for Web Applications on AWS
tags:
  - aws
description: Deciding were and how to run your containers on AWS can be confusing, but it doesn't have to be!
---

When it comes to containers on AWS there are a lot of options. We have App Runner, Lightsail, Elastic Beanstalk, Batch, EC2, Lambda, ECS, and EKS.

I was recently asked by a client to build and deploy a Go HTTP server application on AWS. The client estimated the application would be subject to as little as a hundred requests per second but could spike up to thousands. With a small team that was not specialized in the fine-grained performance tuning of Kubernetes, I advised ECS running on Fargate as a great option.

In this post, I will compare ECS to other AWS service offerings, and explain why I think ECS is a good choice for most web application use cases, especially ones with moderate to high traffic.

## Container Services on AWS

As I said in the beginning, there are a lot of ways to run containers on AWS. Let’s take a look at some different services and organize them by price. As is common with many cloud services, there is typically a trade-off where higher-priced options offer reduced overhead, and less management and configuration effort on your part.

### Most Expensive - Fully Managed Services

**App Runner**

App Runner is a fully managed service for building web applications and APIs without any infrastructure cost required. App Runner is great for quick application development use cases. It is much easier to set up and get an application running versus other options. 

At roughly more than 3 times the cost of ECS Fargate and a pay-as-you-go pricing model, this is not an ideal solution for any application that has moderately low to high traffic.

**Lightsail**

Lightsail Container Service provides a straightforward solution for running Docker containers in the cloud, enabling customers to easily deploy and access containerized applications from the internet. This service simplifies the process by allowing developers to push Docker images, while Lightsail handles the complexities of infrastructure management.

Lightsail has a fixed, predictable monthly pricing model based on the amount of compute package you select. For applications that have predictable traffic and lower volumes, I think this is a great choice. But for applications with spikes of traffic and that require more nuanced configuration, Lightsail is not a good option.

### Free - Only pay for the underlying services

**Elastic Beanstalk** 

AWS Elastic Beanstalk provides a rapid deployment solution for web applications on AWS, where you just upload your application code and the service automatically manages resource provisioning, load balancing, auto-scaling, and monitoring. This service streamlines the setup process, making it highly efficient for launching and managing applications. It's important to note that with AWS Elastic Beanstalk, developers retain full control over the AWS resources powering their application.

There is no cost to using Elastic Beanstalk, you only pay for the underlying resources that it creates for your application. When running containers on Elastic Beanstalk you have two options to run on the Docker Platform or to run on ECS. While I think it's great to get started and for small playground applications, I would recommend you provision the ECS Service yourself using IaC, as it’s always easier to configure a service directly instead of configuring it through a proxy like Elastic Beanstalk.

**Batch**

AWS Batch allows you to submit batch job which consists of your task code and dependencies. It dynamically provisions and scales computing resources on ECS, and EKS. But it is designed for jobs that can be executed as one-off tasks or at regular intervals, without requiring persistent server management, making it ideal for applications that need to process large volumes of data across multiple instances in parallel. This includes tasks like data processing, image or video processing, financial modeling, scientific simulations, and other compute-intensive jobs.

There is no cost to using Batch and you only pay for the underlying resources. If you require a data-intensive or ML task, this is a great option.

### Less Expensive - Partially Managed Services

**EC2**

You can of course provision an EC2 instance, install the docker engine, upload source code files, build the docker image, and push the container to a registry. This will require several other areas of expertise including accessing the EC2 instance either through an SSH tunnel or session manager and managing operating system users and permissions.
This is a decent option for very low-volume use cases (assuming you have the EC2 knowledge), but this solution would require container orchestration to spin up and spin down containers as traffic spikes, you need to manage the capacity of the actual EC2 instance as well. Given the management cost and monetary cost of EC2 resources, I think this is only a good option for learning purposes, and I would not recommend this approach for any legitimate use case.

**Lambda**

In December 2020, Lambda announced the ability to host containers. This update allowed users to package and deploy Lambda functions as container images of up to 10 GB in size. Lambda is an excellent compute platform for event-driven scenarios such as changes in data or actions by users but I haven’t found a good reason to use them for containers yet. First off, Lambda’s execution time cannot exceed 15 minutes, making it unsuitable for long-running processes like web servers. You can of course use Api Gateway with Lambda to build an HTTP API. However, there are several downsides to that architecture as well. Lambda’s are subject to cold starts, which you can remove by paying for more provisioned concurrency. However, to me, that seems like a waste of resources because if you need a more available computing platform, you should use a different tool instead of trying to make Lambda something it's not. In addition, API Gateway has hard limits around RPS and can get very expensive at higher volumes. Finally, limits on the CPU, memory, and storage available to Lambda containers, no direct network access or VPC support, and limited runtime configuration make Lambda less than ideal for our web application use case.

For short-lived, simple, event-driven tasks Lambda is a great platform and its use cases are many. And at lower volumes of traffic, for certain projects, I think using API Gateway with Lambda is a good fit. However, I would not recommend Lambda for hosting an entire web application. 

### The Real Choice

We have briefly reviewed the container landscape on AWS. Yet none of the options I have mentioned so far are suitable for moderate to high-traffic web applications. For this use case, there are only two options. EKS or ECS. Let’s take a quick look at each service and then wrap up with why I prefer to use ECS Fargate for most use cases.

https://lh3.googleusercontent.com/a/AEdFTp6T0OEXpTcWBu-G1dSqgrADUDx3HqaFpqBCEmrqMw=s96-c

**EKS**

The Elastic Kubernetes Service or EKS is incredible, especially considering it usually takes an army of engineering resources to manage self-hosted Kubernetes infrastructure. EKS is a partially managed service that simplifies running Kubernetes without requiring the installation and operation of the Kubernetes control plane or nodes. EKS offers scalable and secure cluster management, integrating seamlessly with other AWS services for computing, storage, and networking.

With EKS, you have more control over the Kubernetes cluster and infrastructure, including version upgrades and rollbacks, node configuration, cluster scaling, more advanced scheduling options, more advanced networking features, and excellent handling of container orchestration with very nuanced configuration options. Finally, Kubernetes also offers advanced traffic management, security, and observability features for microservices. For very large-scale applications that span several services, Kubernetes is probably the only choice.

That being said, a deep understanding of the Kubernetes ecosystem will be required to make the most of EKS. Kubernetes does have a steep learning curve and most teams are not familiar or prepared to work with this technology. Yet when used correctly I have seen immense cost savings and scale accomplished with Kubernetes. For teams that have experience configuring and working with Kubernetes, EKS is a great option since it will remove a lot of the operational burden of the supporting infrastructure.

But most web applications probably do not need such advanced features that Kubernetes offers. I think teams should only start to consider Kubernetes if their product offering is large enough, their scale is large enough, and their revenue is high enough.

**ECS**

This brings us to ECS. I must admit that I love this service. Here is why.

Elastic Container Service or ECS is a fully managed container orchestration service that allows you to easily run, scale, and manage Docker containers on AWS.

There are two ways to launch an ECS cluster EC2 and Fargate. The EC2 launch type allows you to run containers on your own EC2 instances, offering more control but requiring more management. The Fargate launch type is a managed infrastructure option that offers simplicity and scalability but with less control over the underlying instances.

If you have a more complex networking requirement or you just want to control and optimize the resources of the underlying EC2 instances, then running your ECS clusters on EC2 is a great option.

But for most use cases, especially with moderate to high traffic, I would recommend that you leverage Fargate. Running your ECS Clusters on Fargate offers no infrastructure management, a pay-as-you-go serverless pricing model, easy scaling capabilities, and is relatively simple to set up. At very high sustained traffic volumes there is a concern of higher costs than other options, so if you have many tens of thousands of requests per second sustained throughout the day then I would consider other options and do a deep cost comparison. Yet for most web applications with moderate to high traffic ECS Fargate is probably the best choice, since it will provide a tremendous amount of leverage considering how simple it is to configure and how well it will be able to scale up and scale down automatically. 

---

While there are several container services on AWS, for web application hosting, especially in scenarios with moderate to high traffic ECS Fargate is my go-to option. It eliminates the need for infrastructure management and offers pay-as-you-go pricing, easy scaling, and streamlined setup. Ultimately, the right choice will depend on your specific use case, team expertise, and application requirements. I hope this review of AWS container services was helpful and gave you a better understanding of the options available to you.
