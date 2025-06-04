export async function handleFollow(user_id, group_id) {
  try {
    const response = await fetch(`http://localhost:8404/follow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: parseInt(user_id),
        group_id: parseInt(group_id),
      }),
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to follow user");
    }
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return data === "unfollow" ? "Following" : data === "follow" ? "Follow" : "Pending";
  } catch (error) {
    console.error("Error following user:", error);
  }
}

export async function handelAccept(user_id, group_id) {
  try {
    await fetch(`http://localhost:8404/accept_invitation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: parseInt(user_id),
        group_id: parseInt(group_id),
      }),
      credentials: "include",
    });
  }
  catch (error) {
    console.error("Error accepting user:", error);
  }
}

export async function handleReject(user_id, group_id) {
  try {
    await fetch(`http://localhost:8404/reject_invitation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: parseInt(user_id),
        group_id: parseInt(group_id),
      }),
      credentials: "include",
    });

  }
  catch (error) {
    console.error("Error rejecting user:", error);
  }
}

export async function handelAcceptOtherGroup(user_id, group_id) {
  try {
    await fetch(`http://localhost:8404/accept_invitation_other`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: parseInt(user_id),
        group_id: parseInt(group_id),
      }),
      credentials: "include",
    });
  }
  catch (error) {
    console.error("Error accepting user:", error);
  }
}

export async function handleRejectOtherGroup(user_id, group_id) {
  try {
    await fetch(`http://localhost:8404/reject_invitation_other`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: parseInt(user_id),
        group_id: parseInt(group_id),
      }),
      credentials: "include",
    });
  }
  catch (error) {
    console.error("Error rejecting user:", error);
  }
}