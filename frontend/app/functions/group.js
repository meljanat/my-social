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

async function deleteGroup(group_id) {
  try {
    const response = await fetch(`http://localhost:8404/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(parseInt(group_id)),
    });
  } catch (err) {
    console.log(err);
  }
}

async function InvitUsers(group_id) {
  try {
    const response = await fetch(`http://localhost:8404/add_members?group_id=${group_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch group data");
    }
    const data = await response.json();
    console.log(`Group Members Data:`, data);
  } catch (err) {
    console.log(err);
  }
}
export { joinGroup, deleteGroup };
