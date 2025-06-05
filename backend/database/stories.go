package database

import (
	"database/sql"
	"time"

	structs "social-network/data"
)

func CreateStory(image string, user_id int64) (int64, error) {
	result, err := DB.Exec("INSERT INTO stories (user_id, image) VALUES (?, ?)", user_id, image)
	if err != nil {
		return 0, err
	}

	lastID, err := result.LastInsertId()
	return lastID, err
}

func StoryStatus(story_id int64, followers []int64) error {
	for _, follower := range followers {
		_, err := DB.Exec("INSERT INTO stories_status (story_id, user_id, read) VALUES (?, ?, ?)", story_id, follower, false)
		return err
	}
	return nil
}

func GetStories(user structs.User, following []structs.User) ([]structs.Stories, error) {
	following = append(following, user)
	var stories []structs.Stories
	stories_ids := []int64{}
	for _, usr := range following {
		var user_stories structs.Stories
		user_stories.User = usr
		rows, err := DB.Query("SELECT id, image, created_at FROM stories WHERE user_id = ?", usr.ID)
		if err != nil {
			return nil, err
		}
		defer rows.Close()
		for rows.Next() {
			var story structs.Story
			if err := rows.Scan(&story.ID, &story.Image, &story.CreatedAt); err != nil {
				return nil, err
			}
			if time.Since(story.CreatedAt) > 24*time.Hour {
				stories_ids = append(stories_ids, story.ID)
				continue
			}
			user_stories.Stories = append(user_stories.Stories, story)
		}
		if len(user_stories.Stories) > 0 {
			GetStatusStory(&user_stories.Stories, user.ID)
			user_stories.UnseenStory = user_stories.Stories[len(user_stories.Stories)-1].IsRead
			stories = append(stories, user_stories)
		}
	}
	for _, story_id := range stories_ids {
		if err := DeleteSt1ory(story_id); err != nil {
			return nil, err
		}
	}
	return stories, nil
}

func GetStatusStory(stories *[]structs.Story, user_id int64) error {
	for i := 0; i < len(*stories); i++ {
		err := DB.QueryRow("SELECT read FROM stories_status WHERE story_id = ? AND user_id = ?", (*stories)[i].ID, user_id).Scan(&(*stories)[i].IsRead)
		if err == sql.ErrNoRows {
			InsertStatusStory((*stories)[i].ID, user_id)
		} else if err != nil {
			return err
		}
	}
	return nil
}

func InsertStatusStory(story_id int64, user_id int64) error {
	_, err := DB.Exec("INSERT INTO stories_status (story_id, user_id, read) VALUES (?, ?, ?)", story_id, user_id, false)
	return err
}

func SeenStory(id_story int64, id_user int64) error {
	_, err := DB.Exec("UPDATE stories_status SET read = ? WHERE story_id = ? AND user_id = ?", 1, id_story, id_user)
	return err
}

func DeleteSt1ory(id_story int64) error {
	_, err := DB.Exec("DELETE FROM stories WHERE id = ?", id_story)
	return err
}
