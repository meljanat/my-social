async function InvitUsers(group_id) {
  try {
    const response = await fetch(
      `http://localhost:8404/add_members?group_id=${group_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch group data");
    }
    const data = await response.json();
    setUsersToInvite(data);
  } catch (err) {
    console.log(err);
  }
}

export { InvitUsers };
