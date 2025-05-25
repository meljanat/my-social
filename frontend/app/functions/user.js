export async function handleFollow(user_id, group_id) {
  console.log("user_id:", user_id);
  console.log("group_id:", group_id);
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

    if (response.ok) {
      console.log("Followed successfully");
      response.json().then((data) => {
        return data;
      });
    }
    const data = await response.json();
    console.log("Followed user:", data);
  } catch (error) {
    console.error("Error following user:", error);
  }
}

export async function handelAccept(user_id, group_id) {
  try {
    const response = await fetch(`http://localhost:8404/accept_invitation`, {
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
    if (response.ok) {
      console.log("Accepted successfully");
      response.json().then((data) => {
        return data;
      });
    }
    const data = await response.json();
    console.log("Accepted user:", data);
  }
    catch (error) {
    console.error("Error accepting user:", error);
  }
}

export async function handleReject(user_id, group_id) {
  try {
    const response = await fetch(`http://localhost:8404/reject_invitation`, {
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
    if (response.ok) {
      console.log("Rejected successfully");
      response.json().then((data) => {
        return data;
      });
    }
    const data = await response.json();
    console.log("Rejected user:", data);
  }
  catch (error) {
    console.error("Error rejecting user:", error);
  }
}