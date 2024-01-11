import { createProfile, sendWelcomeEmail } from "@lib/courier";
import { updateSubscriberStatus } from "@lib/subscriber";
import type { APIRoute } from "astro";


export const GET: APIRoute = async ({ params, request }) => {
  const subscriberId = params.subscriberId;

  if (!subscriberId && typeof subscriberId !== "string") {
    return Response.redirect("/");
  }

  const subscriber = await updateSubscriberStatus(subscriberId, "subscribed");

  await createProfile(subscriber);

  await sendWelcomeEmail(subscriber);

  return new Response(null, {
    status: 302,
    headers: {
      // TODO: update this to redirect to the survey page
      // Location: "/survey",
      Location: "/thank-you",
    },
  });
}
