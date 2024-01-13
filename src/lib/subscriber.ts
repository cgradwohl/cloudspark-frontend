import { nanoid } from "nanoid";
import { turso } from "./turso";

type SubscriberStatus = "subscribed" | "unsubscribed" | "pending";
type ISO8601 = string;

export type Subscriber = {
  created: ISO8601;
  email: string;
  givenName: string;
  subscriberId: string;
  status: SubscriberStatus;
  updated: ISO8601;
};

export function SubscriberFactory(params: {
  email: string,
  givenName: string,
  status?: SubscriberStatus,
  subscriberId?: string
}
): Subscriber {
  const {
    email,
    givenName,
    status,
    subscriberId
  } = params
  const now = new Date().toISOString();

  return {
    created: now,
    email,
    givenName,
    subscriberId: subscriberId ? subscriberId : nanoid(),
    status: status ? status : "pending",
    updated: now,
  };
}

export async function createSubscriber(email: string, givenName: string) {
  const subscriber = SubscriberFactory({ email, givenName });
  await turso.execute({
    sql: `INSERT INTO subscribers
    (
      created,
      email,
      givenName,
      subscriberId,
      status,
      updated
    )
    VALUES
    (?, ?, ?, ?, ?, ?);`,
    args: [
      subscriber.created,
      subscriber.email,
      subscriber.givenName,
      subscriber.subscriberId,
      subscriber.status,
      subscriber.updated
    ]
  });

  return subscriber;
}

export async function getSubscriber(subscriberId: string) {
  const result = await turso.execute({
    sql: `SELECT * FROM subscribers WHERE subscriberId = ?;`,
    args: [
      subscriberId
    ]
  });

  if (result.rows.length === 0) return undefined;

  if (typeof result.rows[0].email !== 'string') throw new Error('email is not a string');
  if (typeof result.rows[0].givenName !== 'string') throw new Error('givenName is not a string');
  if (typeof result.rows[0].status !== 'string') throw new Error('status is not a string');
  if (typeof result.rows[0].subscriberId !== 'string') throw new Error('subscriberId is not a string');

  return SubscriberFactory({
    email: result.rows[0].email,
    givenName: result.rows[0].givenName,
    status: result.rows[0].status as SubscriberStatus,
    subscriberId: result.rows[0].subscriberId
  });
}

export async function updateSubscriberStatus(subscriberId: string, status: SubscriberStatus) {
  const subscriber = await getSubscriber(subscriberId);

  if (!subscriber) throw new Error(`Subscriber ${subscriberId} not found`);

  const now = new Date().toISOString();
  await turso.execute({
    sql: `UPDATE subscribers
    SET
      status = ?,
      updated = ?
    WHERE
      subscriberId = ?;`,
    args: [
      status,
      now,
      subscriberId
    ]
  });

  return {
    ...subscriber,
    status,
    updated: now,
  };
}

export async function deleteSubscriber(subscriberId: string) {
  const subscriber = await getSubscriber(subscriberId);

  if (!subscriber) throw new Error(`Subscriber ${subscriberId} not found`);

  await turso.execute({
    sql: `DELETE FROM subscribers WHERE subscriberId = ?;`,
    args: [
      subscriberId
    ]
  });

  return subscriber;
}
