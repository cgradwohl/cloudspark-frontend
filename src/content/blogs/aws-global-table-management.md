---
author: Chris Gradwohl
date: 2023-12-05T16:53:53.226Z
title: A BASH script for Dynamo DB Global Table Management
tags:
  - aws
  - dynamo
description: Don't rely on Cloud Formation for AWS DynamoDB Global Table Resource Management.
---
AWS Global Tables are a feature of Amazon DynamoDB that provides fully managed, multi-region, and multi-master database tables. This feature makes it easy to replicate data across multiple AWS Regions. In practice, the performance is great and it offers the low-latency access to DynamoDB data, data consistency, and high availability that you would expect from Dynamo.

As part of a recent project to convert 30 Dynamo tables into Global Dynamo tables, I wanted to experiment with different replication strategies and deployment options. During this experimentation process, it quickly became evident that CloudFormation would not be effective in managing these resources. Specifically, once Cloud Formation deployed the Global tables, it was impossible to tear down the stack and resources, since Cloud Formation could not reach across to the other region and delete the table replicas. 

While it is possible to go into the AWS Console and delete the replicas manually, then switch regions, and then delete the main tables, this process is very tedious. So I decided to write this little BASH script instead.

```bash
delete_all_dynamodb_tables() {
    export AWS_PAGER="" # Disable output paging

    echo -e "\033[0;32m\n Deleting all DynamoDB tables and their replicas...\033[0m"

    TABLE_NAMES=$(aws dynamodb list-tables --region $AWS_REGION --query "TableNames" --output text)

    if [ -z "$TABLE_NAMES" ]; then
        echo -e "\033[0;32m\n No DynamoDB tables found in region $AWS_REGION.\033[0m"
        return
    fi

    # Deleting replica tables
    declare -a replica_pids
    for TABLE_NAME in $TABLE_NAMES; do
        TABLE_INFO=$(aws dynamodb describe-table --table-name $TABLE_NAME --region $AWS_REGION)
        IS_GLOBAL_TABLE=$(echo $TABLE_INFO | jq -r ".Table.GlobalTableVersion // empty")

        if [ "$IS_GLOBAL_TABLE" != "None" ] && [ -n "$IS_GLOBAL_TABLE" ]; then
            echo -e "\033[0;32m\n Table $TABLE_NAME is a global table. Initiating deletion of replicas...\033[0m"

            REPLICAS=$(echo $TABLE_INFO | jq -r ".Table.Replicas[].RegionName // empty")
            for REPLICA in $REPLICAS; do
                if [ -n "$REPLICA" ]; then
                    echo -e "\033[0;32m\n Initiating deletion of replica table $TABLE_NAME in region $REPLICA\033[0m"
                    aws dynamodb delete-table --region $REPLICA --table-name $TABLE_NAME &
                    replica_pids+=("$!")
                fi
            done
        fi
    done

    for pid in "${replica_pids[@]}"; do
        wait "$pid"
    done

    echo -e "\033[0;32m\n Waiting for replicas to finish deleting (about 3 minutes)....\033[0m"
    sleep 180
    echo -e "\033[0;32m\n All replicas have been deleted. \033[0m"

    # Deleting main tables
    declare -a main_pids
    for TABLE_NAME in $TABLE_NAMES; do
        # make sure the main table done updating
        while :; do
            TABLE_STATUS=$(aws dynamodb describe-table --table-name $TABLE_NAME --region $AWS_REGION | jq -r ".Table.TableStatus // empty")
            if [ "$TABLE_STATUS" != "UPDATING" ]; then
                break
            fi
            sleep 5
        done

        echo -e "\033[0;32m\n Deleting main DynamoDB table: $TABLE_NAME in region $AWS_REGION\033[0m"
        aws dynamodb delete-table --region $AWS_REGION --table-name $TABLE_NAME &
        main_pids+=("$!")
    done

    for mpid in "${main_pids[@]}"; do
        wait "$mpid"
    done

    echo -e "\033[0;32m\n All DynamoDB tables and their replicas deleted in region $AWS_REGION.\033[0m"
}
```

In order to run this you will need to have the [AWS CLI](https://aws.amazon.com/cli/) installed as well as the [jq utility](https://formulae.brew.sh/formula/jq).

The first thing I did is to mute the pager response from each cli call. The pager response replaces the contents of the terminal with the cli’s JSON response, and requires the user to press ‘q’ to proceed with the bash script which is not ideal when automating a task like this. To disable this behavior just export the variable to an empty string `export AWS_PAGER=""`

The general workflow of the script is as follows. 

First, we need to get a list of tables from the account.

```bash
TABLE_NAMES=$(aws dynamodb list-tables --region $AWS_REGION --query "TableNames" --output text)
```

For each table in the list, we need to determine if it is a Global table, so we can delete its replicas.

We can call the `decsribe-table` api with the table name and then parse the response with `jq`

```bash
TABLE_INFO=$(aws dynamodb describe-table --table-name $TABLE_NAME --region $AWS_REGION)
IS_GLOBAL_TABLE=$(echo $TABLE_INFO | jq -r ".Table.GlobalTableVersion // empty")
```

If the table is a Global table, then we need to first delete the replicas before we can delete the table. We can parse the response from the `describe-table` call with `jq` again to get the replica name. 

```bash
REPLICAS=$(echo $TABLE_INFO | jq -r ".Table.Replicas[].RegionName // empty")
for REPLICA in $REPLICAS; do
    if [ -n "$REPLICA" ]; then
        echo -e "\033[0;32m\n Initiating deletion of replica table $TABLE_NAME in region $REPLICA\033[0m"
        aws dynamodb delete-table --region $REPLICA --table-name $TABLE_NAME &
        replica_pids+=("$!")
    fi
done
```

What I found interesting here is that you can delete a replica table the same way you would delete any other table. Deleting the global table stops replication to that Region and deletes the table copy kept in that Region. However, you cannot stop replication while keeping copies of the table as independent entities, nor can you pause replication.

I found that I needed to wait for the replica deletion to complete before proceeding to delete the global tables. To ensure the bash process of the replica deletion was successful I added an explicit wait for each bash process to complete. When developing this script, Dynamo handled this delete request really fast 98% of the time. But every now and the Dynamo service was slow in deleting  a replica, and the subsequent call to delete the main table would fail, which required me to execute the script twice. To prevent that, I just added a blind wait to ensure that the Dynamo service was all caught up.

```bash
# waiting for bash process to complete
for pid in "${replica_pids[@]}"; do
    wait "$pid"
done

# waiting for dynamo to get caught up
echo -e "\033[0;32m\n Waiting for replicas to finish deleting (about 3 minutes)....\033[0m"
sleep 180
echo -e "\033[0;32m\n All replicas have been deleted. \033[0m"
```

Finally, I did a very similar process to delete the main tables.

```bash
declare -a main_pids
for TABLE_NAME in $TABLE_NAMES; do
    # make sure the main table done updating
    while :; do
        TABLE_STATUS=$(aws dynamodb describe-table --table-name $TABLE_NAME --region $AWS_REGION | jq -r ".Table.TableStatus // empty")
        if [ "$TABLE_STATUS" != "UPDATING" ]; then
            break
        fi
        sleep 5
    done

    echo -e "\033[0;32m\n Deleting main DynamoDB table: $TABLE_NAME in region $AWS_REGION\033[0m"
    aws dynamodb delete-table --region $AWS_REGION --table-name $TABLE_NAME &
    main_pids+=("$!")
done

for mpid in "${main_pids[@]}"; do
    wait "$mpid"
done
```

And that’s it!

This script took me about an hour to develop, but ended up saving me a lot of time over the life of the Global table project.

Feel free to reach out if you have any questions.

https://gist.github.com/cgradwohl/a54dccea99f031541aca748852e706e7

Need to delete the replicas first as regular tables.

<aside>
💡 The AWS cli docs say this:
You can delete a replica table the same way you would delete any other table. Deleting the global table stops replication to that Region and deletes the table copy kept in that Region. However, you cannot stop replication while keeping copies of the table as independent entities, nor can you pause replication.

</aside>

Need to implement a polling mechanism to wait for the replicas to be deleted so that you do not need to wait for each replica to be deleted one by one.
