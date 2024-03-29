import type { Subscriber } from "./subscriber";

function makeCourierUrl(path: string) {
  return `https://api.courier.com/${path}`;
}

function makeCourierHeaders() {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${import.meta.env.COURIER_AUTH_TOKEN}`,
    "Content-Type": "application/json",
  }
}

export async function sendConfirmationEmail(subscriber: Subscriber) {
  const body = {
    message: {
      to: {
        email: subscriber.email,
      },
      data: {
        given_name: subscriber.givenName,
        subscriber_id: subscriber.subscriberId,
      },
      template: "CONFIRM_SUBSCRIBE",
    }
  }

  return fetch(makeCourierUrl("send"), {
    method: "POST",
    headers: makeCourierHeaders(),
    body: JSON.stringify(body),
  });
}

export async function sendWelcomeEmail(subscriber: Subscriber) {
  const body = {
    message: {
      to: {
        email: subscriber.email,
      },
      data: {
        given_name: subscriber.givenName,
        subscriber_id: subscriber.subscriberId,
      },
      template: "WELCOME_TO_CLOUDSPARK",
    }
  }

  return fetch(makeCourierUrl("send"), {
    method: "POST",
    headers: makeCourierHeaders(),
    body: JSON.stringify(body),
  });
}

export async function sendUnsubscribeEmail(subscriber: Subscriber) {
  const body = {
    message: {
      to: {
        email: subscriber.email,
      },
      data: {
        given_name: subscriber.givenName,
        subscriber_id: subscriber.subscriberId,
      },
      template: "CONFIRM_UNSUBSCRIBE",
    }
  }

  return fetch(makeCourierUrl("send"), {
    method: "POST",
    headers: makeCourierHeaders(),
    body: JSON.stringify(body),
  });
}


export async function createProfile(subscriber: Subscriber) {
  const body = {
    profile: {
      email: subscriber.email,
      email_verified: subscriber.status === "subscribed" ? true : false,
      given_name: subscriber.givenName,
    },
  };

  return fetch(makeCourierUrl(`profiles/${subscriber.subscriberId}`), {
    method: "POST",
    headers: makeCourierHeaders(),
    body: JSON.stringify(body),
  });
}

export async function deleteProfile(subscriber: Subscriber) {
  return fetch(makeCourierUrl(`profiles/${subscriber.subscriberId}`), {
    method: "DELETE",
    headers: makeCourierHeaders(),
  });
}

