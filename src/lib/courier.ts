async function createProfile(email: string, profileId: string) {
  const url = `https://api.courier.com/profiles/${profileId}`;

  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${import.meta.env.COURIER_AUTH_TOKEN}`,
    "Content-Type": "application/json",
  };

  const body = {
    profile: {
      email,
    },
  };

  return fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  });
}

export {
  createProfile,
};
