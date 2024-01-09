import { nanoid } from "nanoid";
import { turso } from "./turso";
import type { ResultSet } from "@libsql/client";

type SubscriberId = string;
type SubscriberStatus = "subscribed" | "unsubscribed" | "pending";
type ISO8601 = string;

export type Subscriber = {
  created: ISO8601;
  email: string;
  subscriberId: SubscriberId;
  status: SubscriberStatus;
  ttl: number;
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
    ttl: 0,
    updated: now,
  };
}

export async function createSubscriber(subscriber: Subscriber): Promise<ResultSet> {
  const resultSet = await turso.execute(
    `INSERT INTO subscribers
      (
        created,
        email,
        subscriberId,
        status,
        ttl,
        updated
      )
      VALUES
      (
        ${subscriber.created},
        ${subscriber.email},
        ${subscriber.subscriberId},
        ${subscriber.status},
        ${subscriber.ttl},
        ${subscriber.updated}
      );`
  );

  return resultSet;
}

