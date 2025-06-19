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
    console.log(group_id);

    if (response.ok) {
      console.log("Joined group successfully");
    }
  } catch (error) {
    console.error(error);
  }
}

async function leaveGroup(group_id) {
  console.log("Leaving group with ID:", group_id);
}

async function InvitUsers(group_id) {
  console.log("group_id", group_id);

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
    console.log(`Group Members Data:`, data);
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
    console.log(`Data:`, data);
    setIsLoading(false);
  } catch (error) {
    console.error("Error fetching group data:", error);
    setGroupData([]);
    setIsLoading(false);
  }
}
export { joinGroup, leaveGroup, InvitUsers, fetchGroupData };
