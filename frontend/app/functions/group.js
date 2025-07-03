async function joinGroup(group_id) {
  try {
    const response = await fetch(`http://localhost:8404/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(parseInt(group_id)),
    });
  } catch (error) {
    console.error(error);
  }
}

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

async function fetchGroupData(endpoint) {
  try {
    setIsLoading(true);
    const response = await fetch(
      `http://localhost:8404/groups?type=${endpoint}&offset=0`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch group data");
    }
    const data = await response.json();
    if (endpoint === "joined") {
      setMyGroups(data);
    }
    setGroupData(data);
    setIsLoading(false);
  } catch (error) {
    console.error("Error fetching group data:", error);
    setGroupData([]);
    setIsLoading(false);
  }
}
export { joinGroup, InvitUsers, fetchGroupData };
