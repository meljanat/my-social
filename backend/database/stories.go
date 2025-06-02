package database

import (
	"fmt"
	"time"

	structs "social-network/data"
)

func CreateStory(image string, user_id int64) error {
	_, err := DB.Exec("INSERT INTO stories (user_id, image) VALUES (?, ?)", user_id, image)
	return err
}

func GetStories(following []structs.User) ([]structs.Stories, error) {
	var stories []structs.Stories
	stories_ids := []int64{}
	for _, usr := range following {
		var user_stories structs.Stories
		user_stories.User = usr
		rows, err := DB.Query("SELECT s.id, s.image, ss.read, s.created_at FROM stories s JOIN stories_status ss ON s.id == ss.story_id WHERE s.user_id = ?", usr.ID)
		if err != nil {
			return nil, err
		}
		defer rows.Close()
		for rows.Next() {
			var story structs.Story
			if err := rows.Scan(&story.ID, &story.Image, &story.IsRead, &story.CreatedAt); err != nil {
				return nil, err
			}
			if time.Since(story.CreatedAt) > 24*time.Hour {
				stories_ids = append(stories_ids, story.ID)
				continue
			}
			user_stories.Stories = append(user_stories.Stories, story)
		}
		if len(user_stories.Stories) > 0 {
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

func SeenStory(id_story int64, id_user int64) error {
	_, err := DB.Exec("UPDATE stories_status SET read = 1 WHERE story_id = ? AND user_id = ?", id_story, id_user)
	return err
}

func DeleteSt1ory(id_story int64) error {
	_, err := DB.Exec("DELETE FROM stories WHERE id = ?", id_story)
	fmt.Println("Deleting story with ID:", id_story, err)
	return err
}
