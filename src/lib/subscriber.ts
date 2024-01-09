import { nanoid } from "nanoid";
import { turso } from "./turso";
import type { ResultSet } from "@libsql/client";

type SubscriberStatus = "subscribed" | "unsubscribed" | "pending" | "deleted";
type ISO8601 = string;

export type Subscriber = {
  created: ISO8601;
  email: string;
  subscriberId: string;
  status: SubscriberStatus;
  updated: ISO8601;
};

export function SubscriberFactory(
  email: string,
  status: SubscriberStatus = "pending"
): Subscriber {
  const now = new Date().toISOString();
  const subscriberId = nanoid();

  return {
    created: now,
    email,
    subscriberId,
    status,
    updated: now,
  };
}

export async function createSubscriber(subscriber: Subscriber): Promise<ResultSet> {
  const resultSet = await turso.execute({
    sql: `INSERT INTO subscribers
    (
      created,
      email,
      subscriberId,
      status,
      updated
    )
    VALUES
    (?, ?, ?, ?, ?);`,
    args: [
      subscriber.created,
      subscriber.email,
      subscriber.subscriberId,
      subscriber.status,
      subscriber.updated
    ]
  });
  return resultSet;
}

